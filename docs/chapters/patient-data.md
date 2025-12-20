# Patient Data Management

This chapter covers encrypted patient data submission, validation, and privacy preservation.

## Overview

The privacy-preserving medical research platform enables patients to securely submit their sensitive medical data without exposing it to intermediaries or researchers.

## Patient Data Submission Workflow

### Step 1: Patient Verification

Before submitting data, patients must be verified by authorized researchers:

```typescript
// Researcher verifies patient
await contract.connect(researcher).verifyPatient(patientAddress);

// Verify patient is in the system
expect(await contract.isPatientVerified(patientAddress)).to.equal(true);
```

### Step 2: Encrypted Data Submission

Verified patients can submit encrypted medical data:

```typescript
// Patient submits encrypted data
await contract.connect(patient).submitPatientData(
    studyId,
    45,   // age (will be encrypted)
    75,   // symptom score (will be encrypted)
    60    // treatment response (will be encrypted)
);
```

### Step 3: Data Validation

The contract validates all submitted data:

```solidity
require(_age > 0 && _age <= 120, "Invalid age range");
require(_symptomScore <= 100, "Symptom score must be 0-100");
require(_treatmentResponse <= 100, "Treatment response must be 0-100");
require(!patientSubmissions[_studyId][msg.sender].hasSubmitted,
        "Already submitted data for this study");
```

## Encryption and Access Control

### Immediate Encryption

Data is encrypted immediately upon submission:

```solidity
euint8 encryptedAge = FHE.asEuint8(_age);
euint8 encryptedSymptomScore = FHE.asEuint8(_symptomScore);
euint8 encryptedTreatmentResponse = FHE.asEuint8(_treatmentResponse);
```

### Permission Granting

After encryption, access permissions are set:

```solidity
// Grant contract permission to use encrypted values
FHE.allowThis(encryptedAge);
FHE.allowThis(encryptedSymptomScore);
FHE.allowThis(encryptedTreatmentResponse);

// Grant patient permission (for potential decryption)
FHE.allow(encryptedAge, msg.sender);
FHE.allow(encryptedSymptomScore, msg.sender);
FHE.allow(encryptedTreatmentResponse, msg.sender);
```

## Data Collection Lifecycle

### Active Data Collection

Studies transition to data collection when created:

```typescript
const studyInfo = await contract.getStudyInfo(studyId);
expect(studyInfo.dataCollectionActive).to.equal(true);
```

### Automatic Study Completion

Studies automatically complete when target participants are reached:

```typescript
// Submit data from 2nd patient - reaches target
await contract.connect(patient2).submitPatientData(1, 50, 80, 65);

// Study automatically completes
const updatedStudy = await contract.getStudyInfo(1);
expect(updatedStudy.studyCompleted).to.equal(true);
expect(updatedStudy.participantCount).to.equal(2);
```

### Manual Completion

Researchers can manually complete studies before reaching targets:

```typescript
await contract.connect(researcher).completeStudyManually(studyId);
```

## Duplicate Submission Prevention

Each patient can only submit data once per study:

```typescript
// First submission succeeds
await contract.connect(patient).submitPatientData(1, 45, 75, 60);

// Second submission attempt fails
await expect(
    contract.connect(patient).submitPatientData(1, 50, 80, 65)
).to.be.revertedWith("Already submitted data for this study");
```

## Submission Status Queries

Researchers can check if patients have submitted data:

```typescript
const status = await contract.getPatientSubmissionStatus(studyId, patientAddress);
expect(status.hasSubmitted).to.equal(true);
expect(status.submissionTime).to.be.gt(0);
```

## Anti-Patterns to Avoid

### ❌ Submitting Without Verification

```typescript
// This fails - patient not verified
await contract.connect(unverifiedPatient).submitPatientData(1, 45, 75, 60);
// Error: "Patient not verified"
```

### ❌ Invalid Data Ranges

```typescript
// Age out of range
await contract.connect(patient).submitPatientData(1, 0, 75, 60);     // Fails: age < 1
await contract.connect(patient).submitPatientData(1, 121, 75, 60);   // Fails: age > 120

// Scores out of range
await contract.connect(patient).submitPatientData(1, 45, 101, 60);   // Fails: score > 100
await contract.connect(patient).submitPatientData(1, 45, 75, 101);   // Fails: response > 100
```

### ❌ Duplicate Submissions

```typescript
// First submission succeeds
await contract.connect(patient).submitPatientData(1, 45, 75, 60);

// Second attempt fails
await contract.connect(patient).submitPatientData(1, 50, 80, 65);
// Error: "Already submitted data for this study"
```

### ✅ Proper Submission Pattern

```typescript
// 1. Verify patient
await contract.connect(researcher).verifyPatient(patientAddress);

// 2. Validate data ranges
const age = 45;
const symptomScore = 75;
const treatmentResponse = 60;

if (age < 1 || age > 120) throw new Error("Invalid age");
if (symptomScore < 0 || symptomScore > 100) throw new Error("Invalid symptom score");
if (treatmentResponse < 0 || treatmentResponse > 100) throw new Error("Invalid treatment response");

// 3. Submit encrypted data
await contract.connect(patient).submitPatientData(
    studyId,
    age,
    symptomScore,
    treatmentResponse
);

// 4. Verify submission
const status = await contract.getPatientSubmissionStatus(studyId, patientAddress);
expect(status.hasSubmitted).to.equal(true);
```

## Multi-Study Participation

Patients can participate in multiple studies simultaneously:

```typescript
// Create two studies
await contract.connect(researcher).createMedicalStudy("Study A", "Description", 5);
await contract.connect(researcher).createMedicalStudy("Study B", "Description", 5);

// Patient participates in both
await contract.connect(patient).submitPatientData(1, 45, 75, 60);  // Study A
await contract.connect(patient).submitPatientData(2, 45, 75, 60);  // Study B

// Can only submit once per study
await expect(
    contract.connect(patient).submitPatientData(1, 50, 80, 65)
).to.be.revertedWith("Already submitted data for this study");
```

## Privacy Guarantees

- **Encrypted Storage**: Patient data is encrypted on-chain at all times
- **No Individual Decryption**: Individual patient records are never decrypted
- **Aggregation Only**: Only aggregated statistics are computed from encrypted data
- **Immutable**: Once submitted, patient data cannot be changed or accessed directly

---

**Key Takeaway**: Patient data is encrypted immediately upon submission, with strict validation and access control ensuring privacy throughout the research process.
