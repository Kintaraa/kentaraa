use candid::CandidType;
use ic_cdk::{query, update};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use candid::Principal;

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct Report {
    id: u64,
    reporter: Principal,
    timestamp: u64,
    description: String,
    status: ReportStatus,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
enum ReportStatus {
    Submitted,
    UnderReview,
    InProgress,
    Resolved,
}

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct User {
    principal: Principal,
    token_balance: u64,
    reports: Vec<u64>,
}

thread_local! {
    static REPORTS: std::cell::RefCell<HashMap<u64, Report>> = std::cell::RefCell::new(HashMap::new());
    static USERS: std::cell::RefCell<HashMap<Principal, User>> = std::cell::RefCell::new(HashMap::new());
    static REPORT_ID_COUNTER: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

#[update]
fn submit_report(description: String) -> u64 {
    let caller = ic_cdk::caller();
    let report_id = REPORT_ID_COUNTER.with(|counter| {
        let current = *counter.borrow();
        *counter.borrow_mut() = current + 1;
        current
    });

    let report = Report {
        id: report_id,
        reporter: caller,
        timestamp: ic_cdk::api::time(),
        description,
        status: ReportStatus::Submitted,
    };

    REPORTS.with(|reports| {
        reports.borrow_mut().insert(report_id, report);
    });

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        users.entry(caller)
            .and_modify(|user| user.reports.push(report_id))
            .or_insert_with(|| User {
                principal: caller,
                token_balance: 100, // Initial token balance
                reports: vec![report_id],
            });
    });

    report_id
}

#[query]
fn get_report(id: u64) -> Option<Report> {
    REPORTS.with(|reports| reports.borrow().get(&id).cloned())
}

#[query]
fn get_user_reports(user: Principal) -> Vec<Report> {
    USERS.with(|users| {
        if let Some(user) = users.borrow().get(&user) {
            return REPORTS.with(|reports| {
                let reports = reports.borrow();
                user.reports
                    .iter()
                    .filter_map(|id| reports.get(id))
                    .cloned()
                    .collect()
            });
        }
        Vec::new()
    })
}

#[query]
fn get_token_balance(user: Principal) -> u64 {
    USERS.with(|users| {
        users.borrow()
            .get(&user)
            .map(|user| user.token_balance)
            .unwrap_or(0)
    })
}

// Required for candid interface generation
ic_cdk::export_candid!();