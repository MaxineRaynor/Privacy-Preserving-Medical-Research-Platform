# Setup and Deployment

This chapter covers deploying and initializing the Confidential Medical Research contract.

## Contract Deployment Tests

These tests verify proper initialization of the contract state.

### Initial State Verification

Verifies that the contract initializes with correct default values:
- Coordinator is set to deployer
- Study ID counter starts at 1
- Coordinator is automatically authorized as researcher

The deployment fixture ensures optimal test performance by deploying the contract once and reusing it for all tests.

### Timestamp Validation

Ensures the contract records deployment time correctly.

## Deployment Script

The `deploy.ts` script automates contract deployment with:
- Account balance verification
- Contract address logging
- Transaction hash tracking
- Deployment information persistence

### Usage

```bash
# Deploy to local network
npm run deploy:local

# Deploy to Sepolia testnet
npm run deploy
```

### Environment Variables

Required for Sepolia deployment:
- `SEPOLIA_RPC_URL`: RPC endpoint for Sepolia testnet
- `PRIVATE_KEY`: Private key of the deployer account

## Hardhat Configuration

The `hardhat.config.ts` sets up:
- Solidity 0.8.24 with IR optimization
- Network settings for Sepolia and local development
- TypeChain generation for type-safe contract interaction

---

**Next Steps:** After deployment, authorize researchers and create medical studies.
