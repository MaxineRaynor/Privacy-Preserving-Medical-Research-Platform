# Confidential Medical Research - FHEVM Example

## Overview

This is a comprehensive example of a **privacy-preserving medical research platform** built with FHEVM (Fully Homomorphic Encryption Virtual Machine). It demonstrates how to securely collect, store, and analyze encrypted patient data while maintaining complete privacy.

## Key Features

- 🔐 **End-to-End Encryption**: Patient medical data is encrypted on-chain using FHE
- 🏥 **Medical Research Workflow**: Complete study management and data collection lifecycle
- 🔬 **Access Control**: Role-based permissions for researchers and verified patients
- 📊 **Encrypted Analytics**: Compute aggregated results without decrypting individual data
- 🛡️ **Privacy-Preserving**: Individual patient data remains confidential even during analysis

## FHEVM Concepts Demonstrated

### 1. Encryption (`chapter: encryption`)
- Using `FHE.asEuint8()` to encrypt sensitive medical data
- Storing encrypted values on-chain
- Encrypting patient age, symptom scores, and treatment responses

### 2. Access Control (`chapter: access-control`)
- Using `FHE.allow()` to grant specific addresses permission to access encrypted data
- Using `FHE.allowThis()` to grant the contract permission
- Role-based access control for researchers and patients

### 3. Study Management (`chapter: study-management`)
- Creating medical research studies
- Managing data collection lifecycle
- Automatic and manual study completion

### 4. Patient Data (`chapter: patient-data`)
- Patient verification workflow
- Encrypted data submission
- Duplicate submission prevention

## Project Structure

```
.
├── contracts/
│   └── ConfidentialMedicalResearch.sol    # Main smart contract
├── test/
│   └── ConfidentialMedicalResearch.test.ts # Comprehensive test suite
├── scripts/
│   ├── deploy.ts                           # Deployment script
│   └── generate-docs.ts                    # Documentation generator
├── hardhat.config.ts                       # Hardhat configuration
├── package.json                            # Dependencies and scripts
└── docs/                                   # Generated documentation
```

## Getting Started

### Installation

```bash
npm install
```

### Compilation

```bash
npm run compile
```

### Testing

```bash
npm run test
npm run test:verbose
npm run coverage
```

### Deployment

**Local Development:**
```bash
npx hardhat node
npm run deploy:local
```

**Sepolia Testnet:**
```bash
npm run deploy
```

## Test Coverage

The comprehensive test suite covers:

- ✅ Contract deployment and initialization
- ✅ Researcher authorization and verification
- ✅ Patient verification workflows
- ✅ Medical study creation and management
- ✅ Encrypted patient data submission
- ✅ Data validation and error handling
- ✅ Access control enforcement
- ✅ Study completion workflows
- ✅ View functions and queries
- ✅ Multi-study integration scenarios

## Contract Functions

### Study Management
- `createMedicalStudy()` - Create a new research study
- `completeStudyManually()` - Manually complete a study
- `getStudyInfo()` - Retrieve study information

### Patient Management
- `verifyPatient()` - Verify a patient for participation
- `isPatientVerified()` - Check patient verification status
- `getPatientSubmissionStatus()` - Check if patient submitted data

### Data Submission
- `submitPatientData()` - Submit encrypted patient medical data
- `computeAggregatedResults()` - Compute encrypted aggregated results
- `publishResults()` - Publish study results

### Researcher Management
- `authorizeResearcher()` - Authorize a researcher
- `isResearcherAuthorized()` - Check researcher authorization

## Security Considerations

1. **Encryption**: All patient data is encrypted using FHE before storage
2. **Access Control**: Only verified patients can submit data; only authorized researchers can access aggregated data
3. **Validation**: Strict input validation for all medical data
4. **Privacy**: Individual patient data remains encrypted throughout the process
5. **Immutability**: Study data is immutable once submitted

## Events

The contract emits the following events:

- `StudyCreated(uint32 studyId, string title, uint256 startTime)`
- `PatientDataSubmitted(address patient, uint32 studyId)`
- `StudyCompleted(uint32 studyId, uint256 participantCount)`
- `ResultsPublished(uint32 studyId, uint256 timestamp)`
- `PatientVerified(address patient)`
- `ResearcherAuthorized(address researcher)`

## Documentation

- Full JSDoc/TSDoc documentation in all code files
- GitBook-compatible chapter organization
- Inline code comments explaining FHEVM concepts
- Test file documentation with chapter annotations

## License

MIT

## Contributing

This example is part of the Zama FHEVM bounty program. Contributions and improvements are welcome!

---

**For more information about FHEVM and Zama, visit:**
- [Zama Official Website](https://www.zama.ai)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Bounty Program Details](https://bounty.zama.ai)
