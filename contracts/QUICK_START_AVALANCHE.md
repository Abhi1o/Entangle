# 🚀 Quick Start: Deploy to Avalanche

## ⚡ **5-Minute Setup Guide**

### **Step 1: Install Dependencies**
```bash
cd contracts
npm install
```

### **Step 2: Setup Environment**
```bash
# Create .env file
echo "PRIVATE_KEY=your_private_key_here" > .env
```

### **Step 3: Get Test Tokens**
1. Go to https://faucet.avax.network/
2. Enter your wallet address
3. Get free AVAX tokens

### **Step 4: Deploy to Fuji Testnet**
```bash
npm run deploy:fuji
```

### **Step 5: Test the Contract**
```bash
npm run test:fuji
```

### **Step 6: Deploy to Mainnet (Optional)**
```bash
npm run deploy:avalanche
```

---

## 🔧 **Environment Setup**

### **Required Environment Variables**
```env
# Your wallet private key (NEVER share this!)
PRIVATE_KEY=0x1234567890abcdef...

# Optional: Snowtrace API key for verification
AVALANCHE_API_KEY=your_api_key_here
```

### **MetaMask Setup**
1. Open MetaMask
2. Add Network:
   - **Network Name**: Avalanche C-Chain
   - **RPC URL**: https://api.avax.network/ext/bc/C/rpc
   - **Chain ID**: 43114
   - **Symbol**: AVAX

---

## 📋 **Available Commands**

```bash
# Compile contracts
npm run compile

# Deploy to networks
npm run deploy:local      # Local development
npm run deploy:fuji       # Fuji testnet
npm run deploy:avalanche  # Mainnet

# Test contracts
npm run test              # Local tests
npm run test:fuji         # Fuji testnet
npm run test:avalanche    # Mainnet

# Verify on Snowtrace
npx hardhat verify --network avalanche CONTRACT_ADDRESS
```

---

## 🔗 **Useful Links**

- **Faucet**: https://faucet.avax.network/
- **Snowtrace**: https://snowtrace.io/
- **Testnet Explorer**: https://testnet.snowtrace.io/
- **Avalanche Docs**: https://docs.avax.network/

---

## 🎯 **What You'll Get**

After deployment, you'll have:
- ✅ Smart contract deployed on Avalanche
- ✅ Contract address for integration
- ✅ Verified contract on Snowtrace
- ✅ Working auction system
- ✅ Ready for frontend/backend integration

---

## 🆘 **Need Help?**

1. Check the full guide: `AVALANCHE_DEPLOYMENT_GUIDE.md`
2. Read error messages carefully
3. Ensure you have sufficient AVAX balance
4. Verify your private key is correct
5. Check network connectivity

---

*Happy building! 🚀*

