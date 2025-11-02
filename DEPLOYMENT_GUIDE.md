# Complete Deployment Guide - QuizLumen dApp

This guide assumes you're starting fresh with only your Freighter wallet installed.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Smart Contract Deployment](#smart-contract-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Setting Up a Free Domain](#setting-up-a-free-domain)
5. [Git Upload](#git-upload)

---

## 1. Local Development Setup

### Step 1: Install Required Software

#### Install Node.js
1. Go to https://nodejs.org/
2. Download the LTS version (Long Term Support)
3. Run the installer and follow the prompts
4. **Verify installation**: Open PowerShell and run:
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers.

#### Install Rust
1. Go to https://rustup.rs/
2. Download and run `rustup-init.exe`
3. Press Enter to proceed with default installation
4. **Restart your PowerShell** after installation
5. **Verify installation**:
   ```powershell
   rustc --version
   cargo --version
   ```

#### Install Soroban CLI
1. Open PowerShell and run:
   ```powershell
   cargo install --locked soroban-cli
   ```
2. This will take 10-15 minutes to complete
3. **Verify installation**:
   ```powershell
   soroban --version
   ```

#### Install Git
1. Go to https://git-scm.com/download/win
2. Download and install Git for Windows
3. Use default settings during installation
4. **Verify installation**:
   ```powershell
   git --version
   ```

### Step 2: Run the Frontend Locally

1. **Navigate to the frontend folder**:
   ```powershell
   cd E:\QuizLumen\frontend
   ```

2. **Install dependencies** (only need to do this once):
   ```powershell
   npm install
   ```
   This will take a few minutes.

3. **Start the development server**:
   ```powershell
   npm start
   ```

4. **Your browser should automatically open** to `http://localhost:3000`
   - If it doesn't, manually open your browser and go to `http://localhost:3000`

5. **To stop the server**: Press `Ctrl + C` in PowerShell

---

## 2. Smart Contract Deployment

### Step 1: Configure Soroban for Testnet

1. **Add the testnet network**:
   ```powershell
   soroban network add testnet `
     --rpc-url https://soroban-testnet.stellar.org `
     --network-passphrase "Test SDF Network ; September 2015"
   ```

2. **Create or import your Stellar identity**:

   **Option A - Create a new identity**:
   ```powershell
   soroban keys generate alice --network testnet
   ```

   **Option B - Import from Freighter**:
   - Open Freighter wallet in your browser
   - Click on your account name → Settings → Export Private Key
   - Copy the secret key (starts with 'S')
   - Run:
     ```powershell
     soroban keys add alice --secret-key
     ```
   - Paste your secret key when prompted

3. **Get your public key**:
   ```powershell
   soroban keys address alice
   ```
   Copy this address - you'll need it!

4. **Fund your account with testnet XLM**:
   - Go to https://laboratory.stellar.org/#account-creator?network=test
   - Paste your public key
   - Click "Get test network lumens"
   - OR use Friendbot:
     ```powershell
     curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY_HERE"
     ```

5. **Verify your balance**:
   ```powershell
   soroban keys balance alice --network testnet
   ```

### Step 2: Build the Smart Contract

1. **Navigate to the contract directory**:
   ```powershell
   cd E:\QuizLumen\smart-contract\quiz-contract\contracts\quiz-contract
   ```

2. **Build the contract**:
   ```powershell
   cargo build --target wasm32-unknown-unknown --release
   ```
   This compiles your Rust code to WebAssembly.

3. **The compiled contract will be at**:
   ```
   E:\QuizLumen\smart-contract\quiz-contract\target\wasm32-unknown-unknown\release\quiz_contract.wasm
   ```

### Step 3: Deploy the Contract

1. **Deploy to testnet**:
   ```powershell
   soroban contract deploy `
     --wasm E:\QuizLumen\smart-contract\quiz-contract\target\wasm32-unknown-unknown\release\quiz_contract.wasm `
     --source alice `
     --network testnet
   ```

2. **SAVE THE CONTRACT ID!** The output will look like:
   ```
   CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   Copy this entire string - this is your CONTRACT_ID!

### Step 4: Initialize the Contract

1. **Get the native XLM token address for testnet**:
   ```
   CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
   ```
   This is the standard testnet native asset contract.

2. **Initialize the contract** (replace `YOUR_CONTRACT_ID` and `YOUR_ADMIN_PUBLIC_KEY`):
   ```powershell
   soroban contract invoke `
     --id YOUR_CONTRACT_ID `
     --source alice `
     --network testnet `
     -- initialize `
     --admin YOUR_ADMIN_PUBLIC_KEY `
     --fee_amount 100000000 `
     --fee_token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
   ```

   **Note**: `100000000` = 10 XLM (Stellar uses 7 decimal places: 1 XLM = 10,000,000 stroops)

3. **Start the quiz** (so users can register):
   ```powershell
   soroban contract invoke `
     --id YOUR_CONTRACT_ID `
     --source alice `
     --network testnet `
     -- start_quiz `
     --admin YOUR_ADMIN_PUBLIC_KEY
   ```

### Step 5: Update Frontend Configuration

1. **Copy the environment file**:
   ```powershell
   cd E:\QuizLumen\frontend
   Copy-Item .env.example .env
   ```

2. **Edit the `.env` file**:
   - Open `E:\QuizLumen\frontend\.env` in Notepad or VS Code
   - Replace `your_deployed_contract_id_here` with your actual CONTRACT_ID
   - Save the file

3. **The `.env` file should look like**:
   ```
   REACT_APP_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
   REACT_APP_HORIZON_URL=https://horizon-testnet.stellar.org
   REACT_APP_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

4. **Restart your development server** if it's running:
   - Press `Ctrl + C` to stop
   - Run `npm start` again

---

## 3. Frontend Deployment

We'll use **Vercel** (free hosting platform perfect for React apps).

### Step 1: Prepare for Deployment

1. **Create a production build**:
   ```powershell
   cd E:\QuizLumen\frontend
   npm run build
   ```
   This creates an optimized `build/` folder.

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Website (Easiest)

1. **Go to** https://vercel.com/
2. **Sign up** with GitHub, GitLab, or Bitbucket (create account if needed)
3. **Click "Add New" → "Project"**
4. **Import Git Repository** (see Git Upload section first)
5. **Configure**:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add each variable from your `.env` file:
     - `REACT_APP_CONTRACT_ID` = your contract ID
     - `REACT_APP_HORIZON_URL` = `https://horizon-testnet.stellar.org`
     - `REACT_APP_NETWORK_PASSPHRASE` = `Test SDF Network ; September 2015`
7. **Click "Deploy"**
8. **Wait 2-3 minutes** for deployment to complete
9. **You'll get a URL** like `https://your-project.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```powershell
   npm install -g vercel
   ```

2. **Login**:
   ```powershell
   vercel login
   ```

3. **Deploy**:
   ```powershell
   cd E:\QuizLumen\frontend
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? Yes
   - Which scope? (Choose your account)
   - Link to existing project? No
   - What's your project's name? `quizlumen`
   - In which directory is your code located? `./`
   - Want to override the settings? Yes
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Development Command: `npm start`

5. **Add environment variables**:
   ```powershell
   vercel env add REACT_APP_CONTRACT_ID
   ```
   Paste your contract ID when prompted. Repeat for other variables.

6. **Deploy to production**:
   ```powershell
   vercel --prod
   ```

### Alternative: Deploy to Netlify

1. **Go to** https://netlify.com/
2. **Sign up** with GitHub/GitLab/Bitbucket
3. **Click "Add new site" → "Import an existing project"**
4. **Connect to Git** and select your repository
5. **Configure**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
6. **Add environment variables** in Site settings → Build & deploy → Environment
7. **Click "Deploy site"**
8. **You'll get a URL** like `https://your-site.netlify.app`

---

## 4. Setting Up a Free Domain

### Option 1: Use Vercel/Netlify Subdomain (Free)

**Vercel**:
- Go to your project dashboard
- Settings → Domains
- Your default domain: `your-project.vercel.app`
- You can change the project name to customize it

**Netlify**:
- Site settings → Domain management
- Default: `your-site.netlify.app`
- Click "Change site name" to customize

### Option 2: Free Domain from Freenom

1. **Go to** https://www.freenom.com/
2. **Search for a domain** name (.tk, .ml, .ga, .cf, .gq are free)
3. **Click "Check out"** after selecting available domain
4. **Select "12 Months @ FREE"**
5. **Create account** and complete registration
6. **After getting domain**:
   - Go to Vercel/Netlify settings → Domains
   - Add your custom domain
   - You'll get nameserver information
   - Go back to Freenom → My Domains → Manage Domain
   - Update nameservers with what Vercel/Netlify provided
   - Wait 24-48 hours for DNS propagation

### Option 3: Register a Real Domain (Paid but Cheap)

**Namecheap** (~$10-15/year):
1. Go to https://www.namecheap.com/
2. Search and purchase a domain
3. Add to Vercel/Netlify as above

**Google Domains/Cloudflare** (similar pricing):
- Follow same process

---

## 5. Git Upload

### Step 1: Create a GitHub Account

1. **Go to** https://github.com/
2. **Sign up** for a free account
3. **Verify your email**

### Step 2: Create a New Repository

1. **Click the "+" icon** (top right) → "New repository"
2. **Repository name**: `QuizLumen` or `quiz-dapp`
3. **Description**: "Decentralized Quiz dApp on Stellar Blockchain"
4. **Visibility**: Public (for free hosting) or Private
5. **DO NOT initialize** with README (we already have one)
6. **Click "Create repository"**

### Step 3: Create a `.gitignore` File

1. **Create** `E:\QuizLumen\.gitignore`:
   ```
   # Dependencies
   **/node_modules/
   **/target/

   # Environment variables
   .env
   .env.local

   # Build outputs
   **/build/
   **/dist/

   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo

   # OS
   .DS_Store
   Thumbs.db

   # Logs
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*

   # Misc
   .cache/
   *.log
   ```

### Step 4: Upload to GitHub

1. **Initialize Git** in your project folder:
   ```powershell
   cd E:\QuizLumen
   git init
   ```

2. **Add all files**:
   ```powershell
   git add .
   ```

3. **Create your first commit**:
   ```powershell
   git commit -m "Initial commit - QuizLumen dApp"
   ```

4. **Add the remote repository** (replace `YOUR_USERNAME` with your GitHub username):
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/QuizLumen.git
   ```

5. **Push to GitHub**:
   ```powershell
   git branch -M main
   git push -u origin main
   ```

6. **Enter credentials** when prompted:
   - Username: your GitHub username
   - Password: use a Personal Access Token (not your password)
     - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
     - Generate new token → Select `repo` scope → Generate
     - Copy the token and use it as your password

### Step 5: Connect Vercel/Netlify to GitHub

1. **Go to Vercel/Netlify dashboard**
2. **Import project** from GitHub
3. **Select your repository**
4. **Deployments will now be automatic** whenever you push to GitHub!

---

## 6. Testing Your Deployed dApp

### Step 1: Test Wallet Connection

1. **Open your deployed URL**
2. **Ensure Freighter extension is installed and unlocked**
3. **Click "Connect Freighter"**
4. **Approve the connection request**
5. **You should see your public key and balance**

### Step 2: Test Registration

1. **Make sure you have testnet XLM** in your Freighter wallet
2. **Click "Register for Quiz"**
3. **Freighter popup will show the transaction** (10 XLM fee)
4. **Click "Approve"**
5. **Wait for confirmation**

### Step 3: Test Quiz Functionality

1. **Answer the quiz questions**
2. **Click "Submit Answers"**
3. **Approve the transaction** in Freighter
4. **Check the leaderboard** after quiz ends

### Step 4: Admin Functions (If You're the Admin)

1. **End Quiz**: Click "End Quiz" in Admin Panel
2. **Distribute Prizes**: Click "Distribute Prizes"
3. **Winners will receive XLM** to their wallets

---

## 7. Troubleshooting

### Freighter Not Detected

**Problem**: "Freighter wallet extension not detected"

**Solutions**:
1. Make sure Freighter is installed: https://www.freighter.app/
2. Check that Freighter is enabled in your browser extensions
3. Refresh the page completely (Ctrl + F5)
4. Try a different browser (Chrome/Firefox/Edge)
5. Make sure you're not in incognito/private mode

### Contract Not Deployed

**Problem**: Contract service errors or "Invalid contract ID"

**Solutions**:
1. Verify `.env` file has correct `REACT_APP_CONTRACT_ID`
2. Restart development server after changing `.env`
3. Re-deploy: `vercel --prod` if using Vercel

### Transaction Failed

**Problem**: Transactions fail when you click buttons

**Solutions**:
1. Ensure you have enough XLM for fees (at least 1 XLM for fees)
2. Check you're on the correct network (testnet)
3. Verify contract is initialized: `soroban contract invoke --id YOUR_ID --network testnet -- get_quiz_state`
4. Make sure quiz is in "Open" state

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
1. Delete `node_modules` and reinstall:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```
2. Clear npm cache:
   ```powershell
   npm cache clean --force
   ```
3. Check for console errors and fix them

---

## 8. Summary - Quick Command Reference

### Run Locally
```powershell
cd E:\QuizLumen\frontend
npm start
```

### Deploy Smart Contract
```powershell
# Build
cd E:\QuizLumen\smart-contract\quiz-contract\contracts\quiz-contract
cargo build --target wasm32-unknown-unknown --release

# Deploy
soroban contract deploy --wasm ../../target/wasm32-unknown-unknown/release/quiz_contract.wasm --source alice --network testnet

# Initialize (replace YOUR_CONTRACT_ID and YOUR_ADMIN_KEY)
soroban contract invoke --id YOUR_CONTRACT_ID --source alice --network testnet -- initialize --admin YOUR_ADMIN_KEY --fee_amount 100000000 --fee_token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

# Start quiz
soroban contract invoke --id YOUR_CONTRACT_ID --source alice --network testnet -- start_quiz --admin YOUR_ADMIN_KEY
```

### Deploy Frontend
```powershell
cd E:\QuizLumen\frontend
npm run build
vercel --prod
```

### Update Git
```powershell
git add .
git commit -m "Your update message"
git push
```

---

## 9. Going to Production (Mainnet)

**⚠️ ONLY do this when thoroughly tested on testnet!**

1. **Get real XLM** from an exchange (Coinbase, Kraken, Binance)
2. **Update Soroban network** to mainnet:
   ```powershell
   soroban network add mainnet `
     --rpc-url https://soroban-rpc.stellar.org `
     --network-passphrase "Public Global Stellar Network ; September 2015"
   ```
3. **Deploy contract** with `--network mainnet`
4. **Update `.env`**:
   ```
   REACT_APP_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015
   REACT_APP_HORIZON_URL=https://horizon.stellar.org
   REACT_APP_CONTRACT_ID=your_mainnet_contract_id
   ```
5. **Re-deploy** frontend

---

## 10. Support Resources

- **Stellar Discord**: https://discord.gg/stellar
- **Soroban Docs**: https://soroban.stellar.org/docs
- **Freighter Docs**: https://docs.freighter.app/
- **React Docs**: https://react.dev/
- **Vercel Docs**: https://vercel.com/docs
- **This project's GitHub**: https://github.com/YOUR_USERNAME/QuizLumen

---

**Congratulations!** You now have a fully deployed decentralized quiz application! 🎉
