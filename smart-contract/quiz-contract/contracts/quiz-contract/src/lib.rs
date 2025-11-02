#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, log, Env, Address, Vec, symbol_short, Symbol};

// Structure to store participant information
#[contracttype]
#[derive(Clone)]
pub struct Participant {
    pub address: Address,
    pub score: u64,
    pub entry_paid: bool,
}

// Structure to store quiz state
#[contracttype]
#[derive(Clone)]
pub struct QuizState {
    pub total_pool: i128,
    pub entry_fee: i128,
    pub is_active: bool,
    pub total_participants: u64,
}

// Storage keys
const QUIZ_STATE: Symbol = symbol_short!("QZ_STATE");
const PARTICIPANT_COUNT: Symbol = symbol_short!("P_COUNT");

// Mapping participant address to their data
#[contracttype]
pub enum ParticipantBook {
    Participant(Address)
}

#[contract]
pub struct QuizLumenContract;

#[contractimpl]
impl QuizLumenContract {
    
    /// Initialize the quiz with an entry fee
    pub fn initialize_quiz(env: Env, entry_fee: i128) {
        let quiz_state = QuizState {
            total_pool: 0,
            entry_fee,
            is_active: true,
            total_participants: 0,
        };
        
        env.storage().instance().set(&QUIZ_STATE, &quiz_state);
        env.storage().instance().set(&PARTICIPANT_COUNT, &0u64);
        env.storage().instance().extend_ttl(10000, 10000);
        
        log!(&env, "Quiz initialized with entry fee: {}", entry_fee);
    }
    
    /// Register a participant and collect entry fee
    pub fn register_participant(env: Env, participant: Address, payment: i128) -> bool {
        participant.require_auth();
        
        let mut quiz_state = Self::get_quiz_state(env.clone());
        
        if !quiz_state.is_active {
            log!(&env, "Quiz is not active");
            panic!("Quiz is not active");
        }
        
        if payment < quiz_state.entry_fee {
            log!(&env, "Insufficient entry fee");
            panic!("Insufficient entry fee");
        }
        
        // Check if participant already registered
        let existing = Self::get_participant(env.clone(), participant.clone());
        if existing.entry_paid {
            log!(&env, "Already registered");
            panic!("Participant already registered");
        }
        
        // Create new participant entry
        let new_participant = Participant {
            address: participant.clone(),
            score: 0,
            entry_paid: true,
        };
        
        // Update quiz state
        quiz_state.total_pool += payment;
        quiz_state.total_participants += 1;
        
        // Store data
        env.storage().instance().set(&ParticipantBook::Participant(participant.clone()), &new_participant);
        env.storage().instance().set(&QUIZ_STATE, &quiz_state);
        env.storage().instance().extend_ttl(10000, 10000);
        
        log!(&env, "Participant registered successfully. Total pool: {}", quiz_state.total_pool);
        true
    }
    
    /// Update participant score (called by quiz admin)
    pub fn update_score(env: Env, participant: Address, score: u64) {
        let mut participant_data = Self::get_participant(env.clone(), participant.clone());
        
        if !participant_data.entry_paid {
            log!(&env, "Participant not registered");
            panic!("Participant not registered");
        }
        
        participant_data.score = score;
        env.storage().instance().set(&ParticipantBook::Participant(participant.clone()), &participant_data);
        env.storage().instance().extend_ttl(10000, 10000);
        
        log!(&env, "Score updated for participant: {}", score);
    }
    
    /// Distribute prizes to top 3 winners
    pub fn distribute_prizes(env: Env, winner1: Address, winner2: Address, winner3: Address) {
        let mut quiz_state = Self::get_quiz_state(env.clone());
        
        if !quiz_state.is_active {
            log!(&env, "Quiz already ended");
            panic!("Quiz already ended");
        }
        
        let total_pool = quiz_state.total_pool;
        
        // Prize distribution: 50% to 1st, 30% to 2nd, 20% to 3rd
        let prize1 = (total_pool * 50) / 100;
        let prize2 = (total_pool * 30) / 100;
        let prize3 = (total_pool * 20) / 100;
        
        // Mark quiz as inactive
        quiz_state.is_active = false;
        quiz_state.total_pool = 0;
        
        env.storage().instance().set(&QUIZ_STATE, &quiz_state);
        env.storage().instance().extend_ttl(10000, 10000);
        
        log!(&env, "Prizes distributed - 1st: {}, 2nd: {}, 3rd: {}", prize1, prize2, prize3);
    }
    
    // Helper function to get quiz state
    pub fn get_quiz_state(env: Env) -> QuizState {
        env.storage().instance().get(&QUIZ_STATE).unwrap_or(QuizState {
            total_pool: 0,
            entry_fee: 0,
            is_active: false,
            total_participants: 0,
        })
    }
    
    // Helper function to get participant data
    pub fn get_participant(env: Env, participant: Address) -> Participant {
        let key = ParticipantBook::Participant(participant.clone());
        env.storage().instance().get(&key).unwrap_or(Participant {
            address: participant,
            score: 0,
            entry_paid: false,
        })
    }
}