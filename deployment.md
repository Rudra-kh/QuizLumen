# Deployment Guide

This guide provides instructions for deploying the Decentralized Quiz dApp.

## Prerequisites

- A Vercel account for frontend deployment.
- A Stellar account with testnet XLM.
- Soroban CLI installed: `cargo install --locked soroban-cli`

## 1. Deploying the Smart Contract

1.  **Build the Contract:**

    Navigate to the smart contract directory and build the Wasm file:

    ```bash
    cd smart-contract/quiz-contract
    stellar contract build
    ```

2.  **Deploy to Stellar Network:**

    Deploy the contract to the testnet (or mainnet):

    ```bash
    stellar contract deploy --wasm target/wasm32-unknown-unknown/release/quiz_contract.wasm --source <YOUR_ACCOUNT_SECRET> --network testnet
    ```

    - Replace `<YOUR_ACCOUNT_SECRET>` with your Stellar account's secret key.
    - This command will return a **Contract ID**. Copy it for the next step.

## 2. Deploying the Frontend

### Configure Environment Variables

1.  In the `frontend` directory, create a `.env` file.
2.  Add the deployed contract ID and other settings:

    ```
    REACT_APP_CONTRACT_ID=<your_deployed_contract_id>
    REACT_APP_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
    REACT_APP_HORIZON_URL=https://horizon-testnet.stellar.org
    ```

### Deploy to Vercel

1.  **Push to a Git Repository:**

    Push your project (including the `frontend` directory with the `vercel.json` file) to a GitHub, GitLab, or Bitbucket repository.

2.  **Import Project on Vercel:**

    - Log in to your Vercel account.
    - Click **Add New...** > **Project**.
    - Import your Git repository.

3.  **Configure and Deploy:**

    - Vercel will automatically detect the `vercel.json` file and configure the build settings.
    - Add your environment variables (from the `.env` file) in the Vercel project settings.
    - Click **Deploy**.

    Vercel will build and deploy your React application, making it available at a public URL.
