# QuizLumen - Quick Start Guide

A decentralized quiz dApp built on Stellar blockchain with Soroban smart contracts.

## 🚀 Run Locally in 3 Steps

### Prerequisites
- Node.js installed (download from https://nodejs.org/)
- Freighter wallet browser extension (https://www.freighter.app/)

### Step 1: Install Dependencies
```powershell
cd E:\QuizLumen\frontend
npm install
```

### Step 2: Start the Development Server
```powershell
npm start
```

### Step 3: Open in Browser
- Browser should automatically open to `http://localhost:3000`
- If not, manually navigate to `http://localhost:3000`

## ⚠️ Important Note

**The app won't fully work yet because:**
1. The smart contract needs to be deployed to Stellar testnet
2. The `.env` file needs to be configured with the contract ID

**To deploy and configure everything, see: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 🎨 Color Theme

This dApp uses a warm, earthy color palette:
- **#CDD4B1** - Sage Green
- **#FEECD0** - Peach Cream  
- **#FFF9E2** - Ivory
- **#EBECCC** - Light Olive
- **#DCA278** - Terracotta

## 📁 Project Structure

```
QuizLumen/
├── smart-contract/           # Soroban smart contract (Rust)
│   └── quiz-contract/
│       └── contracts/
│           └── quiz-contract/
│               └── src/
│                   └── lib.rs    # Main contract code
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # Blockchain services
│   │   ├── App.js              # Main app
│   │   └── App.css             # Styling
│   └── package.json
├── DEPLOYMENT_GUIDE.md          # Complete deployment instructions
└── README.md                    # This file
```

## 🔧 Common Commands

### Frontend Development
```powershell
cd E:\QuizLumen\frontend

# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Smart Contract Development  
```powershell
cd E:\QuizLumen\smart-contract\quiz-contract\contracts\quiz-contract

# Build contract
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test
```

## 📖 Full Documentation

For complete deployment instructions including:
- Installing Rust and Soroban CLI
- Deploying the smart contract to testnet/mainnet
- Deploying the frontend to Vercel/Netlify
- Setting up a custom domain
- Uploading to GitHub

**See: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 🐛 Troubleshooting

### "Freighter not detected"
- Install Freighter: https://www.freighter.app/
- Make sure it's enabled in browser extensions
- Refresh the page (Ctrl + F5)

### White screen / errors
- Check browser console (F12)
- Make sure `npm install` completed successfully
- Try deleting `node_modules` and running `npm install` again

### Contract errors
- Contract needs to be deployed first
- See DEPLOYMENT_GUIDE.md section 2

## 🎯 Features

- ✅ Freighter wallet integration
- ✅ Registration with XLM fee payment
- ✅ Quiz question interface
- ✅ Answer submission and hashing
- ✅ Leaderboard with real-time scores
- ✅ Admin panel for quiz management
- ✅ Automated prize distribution (50/30/20 split)
- ✅ Modern, animated UI with custom color theme

## 🔗 Resources

- **Stellar Documentation**: https://developers.stellar.org/
- **Soroban Docs**: https://soroban.stellar.org/docs
- **Freighter Wallet**: https://www.freighter.app/
- **React Documentation**: https://react.dev/

## 📝 License

MIT License - feel free to use this project as a learning resource!

---

**Made with ❤️ using Stellar Soroban smart contracts**
