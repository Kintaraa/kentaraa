use candid::{CandidType, Principal};
use ic_cdk::{query, update};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::cell::RefCell;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TokenBalance {
    balance: u64,
    last_updated: u64,
    total_earned: u64,
    total_spent: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TokenTransaction {
    id: u64,
    user: Principal,
    amount: i64,  // Positive for earning, negative for spending
    description: String,
    timestamp: u64,
    service_type: Option<String>,
}

thread_local! {
    static TOKEN_BALANCES: RefCell<HashMap<Principal, TokenBalance>> = RefCell::new(HashMap::new());
    static TOKEN_TRANSACTIONS: RefCell<Vec<TokenTransaction>> = RefCell::new(Vec::new());
    static TRANSACTION_COUNTER: RefCell<u64> = RefCell::new(0);
}

const INITIAL_TOKEN_AMOUNT: u64 = 500;
const DAILY_ENGAGEMENT_REWARD: u64 = 10;
const REPORT_SUBMISSION_REWARD: u64 = 50;
const COMMUNITY_POST_REWARD: u64 = 5;

// Initialize new user with tokens
#[update]
pub async fn initialize_user_tokens() -> Result<u64, String> {
    let user = ic_cdk::caller();
    
    TOKEN_BALANCES.with(|balances| {
        if balances.borrow().contains_key(&user) {
            return Err("User already initialized".to_string());
        }

        let balance = TokenBalance {
            balance: INITIAL_TOKEN_AMOUNT,
            last_updated: ic_cdk::api::time(),
            total_earned: INITIAL_TOKEN_AMOUNT,
            total_spent: 0,
        };

        balances.borrow_mut().insert(user, balance);
        
        // Record initial token grant
        record_transaction(
            user,
            INITIAL_TOKEN_AMOUNT as i64,
            "Initial token grant".to_string(),
            None,
        );

        Ok(INITIAL_TOKEN_AMOUNT)
    })
}

// Get user's token balance
#[query]
fn get_token_balance(user: Principal) -> Result<TokenBalance, String> {
    TOKEN_BALANCES.with(|balances| {
        balances
            .borrow()
            .get(&user)
            .cloned()
            .ok_or_else(|| "User not found".to_string())
    })
}

// Spend tokens
#[update]
async fn spend_tokens(amount: u64, description: String, service_type: Option<String>) -> Result<u64, String> {
    let user = ic_cdk::caller();
    
    TOKEN_BALANCES.with(|balances| {
        let mut balances = balances.borrow_mut();
        let balance = balances.get_mut(&user).ok_or("User not found")?;
        
        if balance.balance < amount {
            return Err("Insufficient tokens".to_string());
        }

        balance.balance -= amount;
        balance.total_spent += amount;
        balance.last_updated = ic_cdk::api::time();

        record_transaction(
            user,
            -(amount as i64),
            description,
            service_type,
        );

        Ok(balance.balance)
    })
}

// Earn tokens
#[update]
async fn earn_tokens(amount: u64, description: String) -> Result<u64, String> {
    let user = ic_cdk::caller();
    
    TOKEN_BALANCES.with(|balances| {
        let mut balances = balances.borrow_mut();
        let balance = balances.get_mut(&user).ok_or("User not found")?;

        balance.balance += amount;
        balance.total_earned += amount;
        balance.last_updated = ic_cdk::api::time();

        record_transaction(
            user,
            amount as i64,
            description,
            None,
        );

        Ok(balance.balance)
    })
}

// Get user's transaction history
#[query]
fn get_transaction_history(user: Principal) -> Vec<TokenTransaction> {
    TOKEN_TRANSACTIONS.with(|transactions| {
        transactions
            .borrow()
            .iter()
            .filter(|tx| tx.user == user)
            .cloned()
            .collect()
    })
}

// Internal function to record transactions
fn record_transaction(user: Principal, amount: i64, description: String, service_type: Option<String>) {
    TOKEN_TRANSACTIONS.with(|transactions| {
        let id = TRANSACTION_COUNTER.with(|counter| {
            let current = *counter.borrow();
            *counter.borrow_mut() = current + 1;
            current
        });

        let transaction = TokenTransaction {
            id,
            user,
            amount,
            description,
            timestamp: ic_cdk::api::time(),
            service_type,
        };

        transactions.borrow_mut().push(transaction);
    });
}

// Reward functions
#[update]
pub async fn reward_daily_engagement() -> Result<u64, String> {
    earn_tokens(DAILY_ENGAGEMENT_REWARD, "Daily engagement reward".to_string()).await
}

#[update]
pub async fn reward_report_submission() -> Result<u64, String> {
    earn_tokens(REPORT_SUBMISSION_REWARD, "Report submission reward".to_string()).await
}

#[update]
pub async fn reward_community_post() -> Result<u64, String> {
    earn_tokens(COMMUNITY_POST_REWARD, "Community post reward".to_string()).await
}

