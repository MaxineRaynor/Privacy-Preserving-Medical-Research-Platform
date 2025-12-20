# Encryption

This chapter demonstrates FHEVM encryption patterns for protecting sensitive medical data.

## Overview

Encryption is the cornerstone of privacy-preserving applications. All patient medical data in this example is encrypted using Fully Homomorphic Encryption before being stored on-chain.

## FHE Data Types

### euint8 - Encrypted 8-bit Unsigned Integer

Used for storing encrypted medical data with smaller ranges:
- Patient age (1-120)
- Symptom scores (0-100)
- Treatment responses (0-100)

### euint32 - Encrypted 32-bit Unsigned Integer

Used for larger values or aggregated results:
- Aggregated statistics
- Computed averages

## Encryption in Smart Contracts

### Encrypting Patient Data

Patient data is encrypted using `FHE.asEuint8()`:

```solidity
function submitPatientData(
    uint32 _studyId,
    uint8 _age,
    uint8 _symptomScore,
    uint8 _treatmentResponse
) external onlyVerifiedPatient {
    // Encrypt patient data
    euint8 encryptedAge = FHE.asEuint8(_age);
    euint8 encryptedSymptomScore = FHE.asEuint8(_symptomScore);
    euint8 encryptedTreatmentResponse = FHE.asEuint8(_treatmentResponse);

    // Store encrypted values
    patientSubmissions[_studyId][msg.sender] = PatientData({
        encryptedAge: encryptedAge,
        encryptedSymptomScore: encryptedSymptomScore,
        encryptedTreatmentResponse: encryptedTreatmentResponse,
        hasSubmitted: true,
        submissionTime: block.timestamp,
        patientAddress: msg.sender
    });
}
```

## Access Control with Encryption

After encrypting data, grant appropriate access permissions:

```solidity
// Grant contract permission to use encrypted values
FHE.allowThis(encryptedAge);
FHE.allowThis(encryptedSymptomScore);
FHE.allowThis(encryptedTreatmentResponse);

// Grant patient permission to decrypt their own data
FHE.allow(encryptedAge, msg.sender);
FHE.allow(encryptedSymptomScore, msg.sender);
FHE.allow(encryptedTreatmentResponse, msg.sender);
```

## Encrypted Data Storage

Encrypted values are stored as `euint8` or `euint32` types in contract state:

```solidity
struct PatientData {
    euint8 encryptedAge;
    euint8 encryptedSymptomScore;
    euint8 encryptedTreatmentResponse;
    bool hasSubmitted;
    uint256 submissionTime;
    address patientAddress;
}
```

## Real-World Applications

### Medical Data Protection
- Patient age and health metrics remain encrypted on-chain
- Individual records are never decrypted during analysis
- Privacy is mathematically guaranteed by FHE

### Regulatory Compliance
- Encrypted data reduces HIPAA/GDPR compliance burden
- Impossible to extract individual records
- Audit trails can be maintained without exposing data

### Computing on Encrypted Data
While full homomorphic encryption allows computation on encrypted data, this example focuses on aggregation through public decryption for simplicity.

## Anti-Patterns to Avoid

### ❌ Missing Access Permissions

```solidity
// WRONG: Encrypted data without access permissions
euint8 encrypted = FHE.asEuint8(value);
// Missing FHE.allowThis(encrypted);
// Missing FHE.allow(encrypted, user);
```

### ❌ Storing Unencrypted Data

```solidity
// WRONG: Storing plaintext medical data
uint8 age = 45;  // This is NOT encrypted!
```

### ❌ Attempting View Functions on Encrypted Data

```solidity
// WRONG: Cannot return encrypted values from view functions
function getAge() external view returns (euint8) {
    return patientData.encryptedAge;  // Will fail!
}
```

### ✅ Proper Encryption Pattern

```solidity
// 1. Encrypt data
euint8 encrypted = FHE.asEuint8(value);

// 2. Grant access permissions
FHE.allowThis(encrypted);
FHE.allow(encrypted, msg.sender);

// 3. Store encrypted value
patientData.encryptedAge = encrypted;
```

## Handles and Encrypted Values

Encrypted values are represented internally as `bytes32` handles:

```solidity
// Convert encrypted value to handle for decryption request
bytes32 handle = FHE.toBytes32(data.encryptedAge);
```

Handles maintain the reference to encrypted data while allowing operations like batching for decryption.

---

**Key Takeaway**: Always encrypt sensitive data before storage, grant appropriate access permissions, and never attempt to decrypt within the contract unless using explicit decryption requests.
