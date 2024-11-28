use candid::{CandidType, Principal};
use ic_cdk::{query, update};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub enum ServiceType {
    Legal,
    Medical,
    Counseling,
    Police,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
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

thread_local! {
    static SERVICE_REQUESTS: std::cell::RefCell<HashMap<u64, ServiceRequest>> = std::cell::RefCell::new(HashMap::new());
    static APPOINTMENTS: std::cell::RefCell<HashMap<u64, Appointment>> = std::cell::RefCell::new(HashMap::new());
    static REQUEST_COUNTER: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
    static APPOINTMENT_COUNTER: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

// Service Request Functions
#[update]
fn submit_service_request(service_type: ServiceType, description: String, priority: Priority) -> u64 {
    let caller = ic_cdk::caller();
    let request_id = REQUEST_COUNTER.with(|counter| {
        let current = *counter.borrow();
        *counter.borrow_mut() = current + 1;
        current
    });

    let request = ServiceRequest {
        id: request_id,
        user: caller,
        service_type,
        description,
        status: RequestStatus::Pending,
        timestamp: ic_cdk::api::time(),
        priority,
    };

    SERVICE_REQUESTS.with(|requests| {
        requests.borrow_mut().insert(request_id, request);
    });

    request_id
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

// Required for candid interface generation
ic_cdk::export_candid!();