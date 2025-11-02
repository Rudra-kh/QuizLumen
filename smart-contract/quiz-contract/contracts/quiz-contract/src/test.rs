#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    token, Address, BytesN, Env, IntoVal, Symbol,
};

fn create_token_contract<'a>(e: &Env, admin: &Address) -> (token::Client<'a>, token::AdminClient<'a>) {
    let token_client = token::Client::new(e, &e.register_stellar_asset_contract(admin.clone()));
    let token_admin_client = token::AdminClient::new(e, &token_client.address);
    token_admin_client.initialize(admin, &symbol_short!("TST"), &symbol_short!("TEST"), &0);
    (token_client, token_admin_client)
}

#[test]
fn test_quiz_flow() {
    let env = Env::default();
    let admin = Address::generate(&env);
    
    // Create the token contract
    let (token_client, token_admin_client) = create_token_contract(&env, &admin);
    
    // Create participant addresses
    let participant1 = Address::generate(&env);
    let participant2 = Address::generate(&env);
    let participant3 = Address::generate(&env);
    let participant4 = Address::generate(&env);
    
    // Mint some tokens to participants (100 each)
    for participant in [&participant1, &participant2, &participant3, &participant4] {
        token_admin_client.mint(participant, &100);
    }
    
    // Initialize the quiz contract
    let contract_id = env.register_contract(None, QuizContract);
    let quiz_client = QuizContractClient::new(&env, &contract_id);
    quiz_client.initialize(&admin, &10, &token_client.address);
    
    // Start the quiz
    quiz_client.start_quiz(&admin);
    
    // Test registration
    quiz_client.register(&participant1);
    quiz_client.register(&participant2);
    quiz_client.register(&participant3);
    quiz_client.register(&participant4);
    
    // Verify token transfers happened correctly
    assert_eq!(token_client.balance(&participant1), 90);
    assert_eq!(token_client.balance(&participant2), 90);
    assert_eq!(token_client.balance(&participant3), 90);
    assert_eq!(token_client.balance(&participant4), 90);
    
    // Submit answers (using mock hashes)
    quiz_client.submit_answers(
        &participant1,
        &BytesN::from_array(&env, &[255; 32]), // Should give high score
    );
    quiz_client.submit_answers(
        &participant2,
        &BytesN::from_array(&env, &[200; 32]), // Medium score
    );
    quiz_client.submit_answers(
        &participant3,
        &BytesN::from_array(&env, &[150; 32]), // Low score
    );
    quiz_client.submit_answers(
        &participant4,
        &BytesN::from_array(&env, &[100; 32]), // Lowest score
    );
    
    // End quiz
    quiz_client.end_quiz(&admin);
    assert_eq!(quiz_client.get_quiz_state(), QuizState::Closed);
    
    // Get leaderboard
    let leaderboard = quiz_client.get_leaderboard();
    assert_eq!(leaderboard.len(), 4);
    
    // Distribute prizes
    quiz_client.distribute_prizes(&admin);
    
    // Verify prize distribution (50%, 30%, 20% split of 40 tokens)
    // First place should get 20 tokens
    // Second place should get 12 tokens
    // Third place should get 8 tokens
    let winners = env.storage().instance().get::<_, Vec<Address>>(&DataKey::Winners).unwrap();
    assert_eq!(token_client.balance(&winners.get(0).unwrap()), 110); // 90 + 20
    assert_eq!(token_client.balance(&winners.get(1).unwrap()), 102); // 90 + 12
    assert_eq!(token_client.balance(&winners.get(2).unwrap()), 98);  // 90 + 8
}

#[test]
#[should_panic(expected = "Only admin can start the quiz")]
fn test_non_admin_cannot_start_quiz() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let non_admin = Address::generate(&env);
    let (token_client, _) = create_token_contract(&env, &admin);
    
    let contract_id = env.register_contract(None, QuizContract);
    let quiz_client = QuizContractClient::new(&env, &contract_id);
    quiz_client.initialize(&admin, &10, &token_client.address);
    
    // Try to start quiz with non-admin address
    quiz_client.start_quiz(&non_admin);
}

#[test]
#[should_panic(expected = "Quiz is not open for registration")]
fn test_cannot_register_before_quiz_starts() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let participant = Address::generate(&env);
    let (token_client, token_admin_client) = create_token_contract(&env, &admin);
    
    token_admin_client.mint(&participant, &100);
    
    let contract_id = env.register_contract(None, QuizContract);
    let quiz_client = QuizContractClient::new(&env, &contract_id);
    quiz_client.initialize(&admin, &10, &token_client.address);
    
    // Try to register before quiz starts
    quiz_client.register(&participant);
}

#[test]
#[should_panic(expected = "Participant already registered")]
fn test_cannot_register_twice() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let participant = Address::generate(&env);
    let (token_client, token_admin_client) = create_token_contract(&env, &admin);
    
    token_admin_client.mint(&participant, &100);
    
    let contract_id = env.register_contract(None, QuizContract);
    let quiz_client = QuizContractClient::new(&env, &contract_id);
    quiz_client.initialize(&admin, &10, &token_client.address);
    quiz_client.start_quiz(&admin);
    
    // Register once
    quiz_client.register(&participant);
    
    // Try to register again
    quiz_client.register(&participant);
}
