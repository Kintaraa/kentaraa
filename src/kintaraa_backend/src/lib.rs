use crate::token_system::{TokenBalance, TokenTransaction};
use candid::{CandidType, Principal};
use ic_cdk::{query, update};
use serde::{Deserialize, Serialize};
use std::{cell::RefCell, collections::HashMap};
use token_system::initialize_user_tokens;

mod token_system;

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
    location: String,
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
  static REPORT_COUNTER: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
  static PROVIDERS: std::cell::RefCell<HashMap<Principal, Provider>> = std::cell::RefCell::new(HashMap::new());
  static ADMINS: std::cell::RefCell<Vec<Principal>> = std::cell::RefCell::new(Vec::new());
  static REPORTS: std::cell::RefCell<HashMap<u64, ReportRequest>> = std::cell::RefCell::new(HashMap::new());
  static USERS: RefCell<HashMap<Principal, User>> = RefCell::new(HashMap::new());

}
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ReportRequest {
    id: u64,
    user: Principal,
    service_type: ServiceType,
    description: String,
    status: RequestStatus,
    timestamp: u64,
    priority: Priority,
}

// Service Request Functions
#[ic_cdk_macros::update]
pub fn submit_report(request: SubmitReportInput) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    let request_id = REPORT_COUNTER.with(|counter| {
        let current = *counter.borrow();
        *counter.borrow_mut() = current + 1;
        current
    });

    let request = ReportRequest {
        id: request_id,
        user: caller,
        service_type: request.service_type,
        description: request.description,
        status: RequestStatus::Pending,
        timestamp: ic_cdk::api::time(),
        priority: request.priority,
    };

    REPORTS.with(|reports| {
        reports.borrow_mut().insert(request_id, request);
    });

    Ok(request_id)
}

#[derive(CandidType, Deserialize)]
pub struct SubmitReportInput {
    service_type: ServiceType,
    description: String,
    priority: Priority,
}

#[query]
fn get_service_request(id: u64) -> Option<ServiceRequest> {
    SERVICE_REQUESTS.with(|requests| requests.borrow().get(&id).cloned())
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
#[derive(CandidType, Deserialize)]
pub struct ScheduleAppointmentInput {
    service_type: ServiceType,
    datetime: u64,
    notes: String,
    location: String,
}

#[update]
fn schedule_appointment(input: ScheduleAppointmentInput) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    let appointment_id = APPOINTMENT_COUNTER.with(|counter| {
        let current = *counter.borrow();
        *counter.borrow_mut() = current + 1;
        current
    });

    let appointment = Appointment {
        id: appointment_id,
        user: caller,
        service_type: input.service_type,
        datetime: input.datetime,
        location: input.location,
        status: AppointmentStatus::Scheduled,
        notes: input.notes,
    };

    APPOINTMENTS.with(|appointments| {
        appointments
            .borrow_mut()
            .insert(appointment_id, appointment);
    });

    Ok(appointment_id)
}

#[query]
fn get_appointment(id: u64) -> Option<Appointment> {
    APPOINTMENTS.with(|appointments| appointments.borrow().get(&id).cloned())
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

#[ic_cdk_macros::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
#[query]
fn get_service_requests() -> Vec<ServiceRequest> {
    SERVICE_REQUESTS.with(|requests| requests.borrow().values().cloned().collect())
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
    PROVIDERS.with(|providers| providers.borrow().values().cloned().collect())
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
#[query]
fn check_is_admin(user: Principal) -> bool {
    ic_cdk::println!("Checking admin status for user: {}", user.to_string());
    ADMINS.with(|admins| {
        let is_admin = admins.borrow().contains(&user);
        ic_cdk::println!("Is admin result: {}", is_admin);
        is_admin
    })
}

#[update]
fn add_admin(user: Principal) -> Result<(), String> {
    // TODO: Implement proper authorization to restrict admin addition to existing admins only

    ADMINS.with(|admins| {
        admins.borrow_mut().push(user);
    });

    Ok(())
}
#[derive(CandidType, Deserialize)]
pub struct ServiceRequestInput {
    service_type: ServiceType,
    description: String,
    priority: Priority,
    notes: String,
    preferred_contact: String,
    contact_details: String,
    date_time: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct ServiceRequest {
    id: u64,
    user: Principal,
    service_type: ServiceType,
    description: String,
    priority: Priority,
    notes: String,
    preferred_contact: String,
    contact_details: String,
    date_time: u64,
    status: RequestStatus,
    timestamp: u64,
}

#[ic_cdk_macros::update]
pub fn submit_service_request(request: ServiceRequestInput) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    let request_id = REQUEST_COUNTER.with(|counter| {
        let current = *counter.borrow();
        *counter.borrow_mut() = current + 1;
        current
    });

    let service_request = ServiceRequest {
        id: request_id,
        user: caller,
        service_type: request.service_type,
        description: request.description,
        priority: request.priority,
        notes: request.notes,
        preferred_contact: request.preferred_contact,
        contact_details: request.contact_details,
        date_time: request.date_time,
        status: RequestStatus::Pending,
        timestamp: ic_cdk::api::time(),
    };

    SERVICE_REQUESTS.with(|requests| {
        requests.borrow_mut().insert(request_id, service_request);
    });

    Ok(request_id)
}
#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct UserRegistration {
    user_type: String,
    full_name: String,
    email: String,
    license_number: Option<String>,
    organization: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct User {
    id: Principal,
    user_type: String,
    full_name: String,
    email: String,
    license_number: Option<String>,
    organization: Option<String>,
    created_at: u64,
}

thread_local! {}

#[ic_cdk_macros::update]
pub async fn register_user(registration: UserRegistration) -> Result<Principal, String> {
    let caller = ic_cdk::caller();

    // Check if user already exists
    if USERS.with(|users| users.borrow().contains_key(&caller)) {
        return Err("User already registered".to_string());
    }

    // Create new user
    let user = User {
        id: caller,
        user_type: registration.user_type,
        full_name: registration.full_name,
        email: registration.email,
        license_number: registration.license_number,
        organization: registration.organization,
        created_at: ic_cdk::api::time(),
    };

    // Store user
    USERS.with(|users| {
        users.borrow_mut().insert(caller, user);
    });

    // Initialize tokens for new user
    match initialize_user_tokens().await {
        Ok(_) => Ok(caller),
        Err(e) => Err(format!(
            "User created but token initialization failed: {}",
            e
        )),
    }
}

// Required for candid interface generation
ic_cdk::export_candid!();
