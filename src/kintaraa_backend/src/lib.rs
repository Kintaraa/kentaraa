use candid::{CandidType, Principal};
use ic_cdk::{query, update};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::token_system::{TokenBalance, TokenTransaction};

mod token_system;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ServiceRequest {
    id: u64,
    user: Principal,
    service_type: ServiceType,
    description: String,
    status: RequestStatus,
    timestamp: u64,
    priority: Priority,
}

#[derive(CandidType, Serialize, Deserialize, Clone, PartialEq)]
pub enum ServiceType {
    Legal,
    Medical,
    Counseling,
    Police,
}
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ServiceStats {
    pub total_requests: u64,
    pub active_requests: u64,
    pub available_providers: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, PartialEq)]
pub enum RequestStatus {
    Pending,
    InProgress,
    Completed,
    Cancelled,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum Priority {
    Emergency,
    High,
    Medium,
    Low,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Appointment {
    id: u64,
    user: Principal,
    service_type: ServiceType,
    datetime: u64,
    status: AppointmentStatus,
    notes: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum AppointmentStatus {
    Scheduled,
    Confirmed,
    Completed,
    Cancelled,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Report {
    id: u64,
    user: Principal,
    description: String,
    timestamp: u64,
    status: ReportStatus,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum ReportStatus {
    Pending,
    InProgress,
    Completed,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct Provider {
    id: Principal,
    name: String,
    service_type: ServiceType,
    is_available: bool,
    current_load: u64,
    total_cases: u64,
    rating: f64,
}

thread_local! {
    static SERVICE_REQUESTS: std::cell::RefCell<HashMap<u64, ServiceRequest>> = std::cell::RefCell::new(HashMap::new());
    static APPOINTMENTS: std::cell::RefCell<HashMap<u64, Appointment>> = std::cell::RefCell::new(HashMap::new());
    static REQUEST_COUNTER: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
    static APPOINTMENT_COUNTER: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
    static REPORTS: std::cell::RefCell<HashMap<u64, Report>> = std::cell::RefCell::new(HashMap::new());
    static REPORT_COUNTER: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
    static PROVIDERS: std::cell::RefCell<HashMap<Principal, Provider>> = std::cell::RefCell::new(HashMap::new());
}

// Service Request Functions
#[ic_cdk_macros::update]
pub fn submit_service_request(request: ServiceRequestInput) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    let request_id = REQUEST_COUNTER.with(|counter| {
        let current = *counter.borrow();
        *counter.borrow_mut() = current + 1;
        current
    });

    let request = ServiceRequest {
        id: request_id,
        user: caller,
        service_type: request.service_type,
        description: request.description,
        status: RequestStatus::Pending,
        timestamp: ic_cdk::api::time(),
        priority: request.priority,
    };

    SERVICE_REQUESTS.with(|requests| {
        requests.borrow_mut().insert(request_id, request);
    });

    Ok(request_id)
}

#[derive(CandidType, Deserialize)]
pub struct ServiceRequestInput {
    service_type: ServiceType,
    description: String,
    priority: Priority,
}

#[query]
fn get_service_request(id: u64) -> Option<ServiceRequest> {
    SERVICE_REQUESTS.with(|requests| {
        requests.borrow().get(&id).cloned()
    })
}

#[query]
fn get_user_service_requests(user: Principal) -> Vec<ServiceRequest> {
    SERVICE_REQUESTS.with(|requests| {
        requests
            .borrow()
            .values()
            .filter(|request| request.user == user)
            .cloned()
            .collect()
    })
}

// Appointment Functions
#[update]
fn schedule_appointment(service_type: ServiceType, datetime: u64, notes: String) -> u64 {
    let caller = ic_cdk::caller();
    let appointment_id = APPOINTMENT_COUNTER.with(|counter| {
        let current = *counter.borrow();
        *counter.borrow_mut() = current + 1;
        current
    });

    let appointment = Appointment {
        id: appointment_id,
        user: caller,
        service_type,
        datetime,
        status: AppointmentStatus::Scheduled,
        notes,
    };

    APPOINTMENTS.with(|appointments| {
        appointments.borrow_mut().insert(appointment_id, appointment);
    });

    appointment_id
}

#[query]
fn get_appointment(id: u64) -> Option<Appointment> {
    APPOINTMENTS.with(|appointments| {
        appointments.borrow().get(&id).cloned()
    })
}

#[query]
fn get_user_appointments(user: Principal) -> Vec<Appointment> {
    APPOINTMENTS.with(|appointments| {
        appointments
            .borrow()
            .values()
            .filter(|appointment| appointment.user == user)
            .cloned()
            .collect()
    })
}

#[update]
fn update_appointment_status(id: u64, status: AppointmentStatus) -> bool {
    APPOINTMENTS.with(|appointments| {
        if let Some(appointment) = appointments.borrow_mut().get_mut(&id) {
            appointment.status = status;
            true
        } else {
            false
        }
    })
}

#[update]
fn update_request_status(id: u64, status: RequestStatus) -> bool {
    SERVICE_REQUESTS.with(|requests| {
        if let Some(request) = requests.borrow_mut().get_mut(&id) {
            request.status = status;
            true
        } else {
            false
        }
    })
}

#[ic_cdk::update]
pub async fn submit_report(description: String) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    
    if description.trim().is_empty() {
        return Err("Report description cannot be empty".to_string());
    }

    let report_id = REPORT_COUNTER.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() += 1;
        id
    });

    let report = Report {
        id: report_id,
        user: caller,
        description,
        timestamp: ic_cdk::api::time(),
        status: ReportStatus::Pending,
    };

    REPORTS.with(|reports| {
        reports.borrow_mut().insert(report_id, report);
    });

    // Award tokens for submitting report
    match token_system::reward_report_submission().await {
        Ok(_) => Ok(report_id),
        Err(e) => Err(format!("Report submitted but failed to award tokens: {}", e))
    }
}
#[ic_cdk_macros::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
#[query]
fn get_service_requests() -> Vec<ServiceRequest> {
    SERVICE_REQUESTS.with(|requests| {
        requests.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_service_stats(service_type: ServiceType) -> ServiceStats {
    let mut total_requests = 0;
    let mut active_requests = 0;
    let mut available_providers = 0;

    SERVICE_REQUESTS.with(|requests| {
        let requests = requests.borrow();
        for request in requests.values() {
            if request.service_type == service_type {
                total_requests += 1;
                if request.status == RequestStatus::InProgress {
                    active_requests += 1;
                }
            }
        }
    });

    PROVIDERS.with(|providers| {
        let providers = providers.borrow();
        for provider in providers.values() {
            if provider.service_type == service_type && provider.is_available {
                available_providers += 1;
            }
        }
    });

    ServiceStats {
        total_requests,
        active_requests,
        available_providers,
    }
}

#[ic_cdk::query]
fn get_all_providers() -> Vec<Provider> {
    PROVIDERS.with(|providers| {
        providers.borrow().values().cloned().collect()
    })
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ProviderSummary {
    id: Principal,
    service_type: ServiceType,
    name: String,
}

#[derive(CandidType, Deserialize)]
pub struct ProviderInput {
    name: String,
    service_type: ServiceType,
}

#[ic_cdk::update]
async fn add_provider(provider_input: ProviderInput) -> Result<(), String> {
    PROVIDERS.with(|providers| {
        let mut providers = providers.borrow_mut();
        
        // Check if provider with the same name already exists
        for existing_provider in providers.values() {
            if existing_provider.name == provider_input.name {
                return Err("Provider with this name already exists".to_string());
            }
        }
        
        // Generate a new unique ID for the provider
        let provider_id = ic_cdk::api::id();

        let provider = Provider {
            id: provider_id,
            name: provider_input.name,
            service_type: provider_input.service_type,
            is_available: true,
            current_load: 0,
            total_cases: 0,
            rating: 5.0,
        };
        
        providers.insert(provider_id, provider);
        Ok(())
    })
}

// Required for candid interface generation
ic_cdk::export_candid!(); 
