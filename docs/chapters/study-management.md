# Study Management

This chapter demonstrates how to create and manage encrypted medical research studies.

## Overview

The platform provides a complete research workflow for creating studies, enrolling participants, collecting encrypted data, and computing aggregated results.

## Creating a Medical Study

### Valid Study Creation

Creating a study requires:
- A non-empty title
- An optional description
- Target number of participants (must be > 0)

```typescript
const title = "COVID-19 Treatment Response Study";
const description = "Analyzing patient responses to various COVID-19 treatments";
const targetParticipants = 100;

await contract.connect(researcher).createMedicalStudy(
    title,
    description,
    targetParticipants
);
```

### Study Information

After creation, study information can be queried:

```typescript
const studyInfo = await contract.getStudyInfo(studyId);
expect(studyInfo.title).to.equal(title);
expect(studyInfo.description).to.equal(description);
expect(studyInfo.dataCollectionActive).to.equal(true);
expect(studyInfo.studyCompleted).to.equal(false);
expect(studyInfo.targetParticipants).to.equal(targetParticipants);
expect(studyInfo.participantCount).to.equal(0);
```

## Study ID Management

### Auto-Incrementing Study IDs

Studies are automatically assigned sequential IDs:

```typescript
// Create first study (ID = 1)
await contract.connect(researcher).createMedicalStudy("Study 1", "Desc 1", 10);

// Create second study (ID = 2)
await contract.connect(researcher).createMedicalStudy("Study 2", "Desc 2", 20);

// Next ID will be 3
expect(await contract.getCurrentStudyId()).to.equal(3);
```

### Study State Structure

Each study maintains:
- `studyId` - Unique identifier
- `studyTitle` - Research study name
- `description` - Study description
- `dataCollectionActive` - Whether accepting new submissions
- `studyCompleted` - Whether study has finished
- `resultsPublished` - Whether results are public
- `startTime` - Study creation timestamp
- `endTime` - Study completion timestamp
- `targetParticipants` - Enrollment goal
- `participants` - List of enrolled participants
- `aggregatedResults` - Encrypted result statistics
- `hasAggregatedData` - Whether results are computed

## Data Collection Lifecycle

### Active Collection Phase

When created, studies start in active data collection:

```typescript
const studyInfo = await contract.getStudyInfo(studyId);
expect(studyInfo.dataCollectionActive).to.equal(true);
```

Patients can submit encrypted data during this phase.

### Automatic Completion

Studies automatically complete when enrollment reaches the target:

```typescript
// Create study with target of 2 participants
await contract.connect(researcher).createMedicalStudy("Study", "Desc", 2);

// First patient submits
await contract.connect(patient1).submitPatientData(1, 45, 75, 60);

// Second patient submits - automatically completes study
await contract.connect(patient2).submitPatientData(1, 50, 80, 65);

// Study is now completed
const studyInfo = await contract.getStudyInfo(1);
expect(studyInfo.studyCompleted).to.equal(true);
expect(studyInfo.dataCollectionActive).to.equal(false);
expect(studyInfo.participantCount).to.equal(2);
```

### Manual Completion

Researchers can complete studies early:

```typescript
await contract.connect(researcher).completeStudyManually(studyId);

// Verify completion
const studyInfo = await contract.getStudyInfo(studyId);
expect(studyInfo.studyCompleted).to.equal(true);
expect(studyInfo.dataCollectionActive).to.equal(false);
```

### Preventing Data Submission After Completion

Once completed, no new data submissions are accepted:

```typescript
// Study is completed
await contract.connect(researcher).completeStudyManually(studyId);

// Cannot submit data to completed study
await expect(
    contract.connect(newPatient).submitPatientData(studyId, 40, 70, 55)
).to.be.revertedWith("Data collection not active");
```

## Result Computation and Publishing

### Computing Aggregated Results

After completion, researchers can compute encrypted aggregated statistics:

```typescript
// Study is completed with patient data submitted
await contract.connect(researcher).computeAggregatedResults(studyId);
```

This triggers batch decryption of encrypted patient data to compute:
- Average age
- Average symptom score
- Average treatment response

### Publishing Results

Researchers can publish results for public viewing:

```typescript
// Results must be computed first
await contract.connect(researcher).computeAggregatedResults(studyId);

// Then publish
await contract.connect(researcher).publishResults(studyId);

// Verify publication
const studyInfo = await contract.getStudyInfo(studyId);
expect(studyInfo.resultsPublished).to.equal(true);
```

## Anti-Patterns to Avoid

### ❌ Empty Study Title

```typescript
// This fails - title required
await contract.connect(researcher).createMedicalStudy("", "Description", 10);
// Error: "Study title required"
```

### ❌ Zero Target Participants

```typescript
// This fails - at least 1 participant required
await contract.connect(researcher).createMedicalStudy("Study", "Description", 0);
// Error: "Target participants must be greater than 0"
```

### ❌ Unauthorized Study Creation

```typescript
// This fails - only authorized researchers can create studies
await contract.connect(unauthorized).createMedicalStudy("Study", "Description", 10);
// Error: "Not authorized researcher"
```

### ❌ Submitting to Completed Study

```typescript
// Complete the study first
await contract.connect(researcher).completeStudyManually(studyId);

// Cannot submit to completed study
await contract.connect(patient).submitPatientData(studyId, 45, 75, 60);
// Error: "Data collection not active"
```

### ✅ Proper Study Workflow

```typescript
// 1. Researcher creates study
await contract.connect(researcher).createMedicalStudy(
    "Hypertension Treatment Study",
    "Comparing effectiveness of blood pressure medications",
    2
);

// 2. Researcher verifies patients
await contract.connect(researcher).verifyPatient(patient1.address);
await contract.connect(researcher).verifyPatient(patient2.address);

// 3. Patients submit encrypted data
await contract.connect(patient1).submitPatientData(1, 45, 75, 60);
await contract.connect(patient2).submitPatientData(1, 50, 80, 65);

// 4. Study automatically completes (enrollment target reached)
const studyInfo = await contract.getStudyInfo(1);
expect(studyInfo.studyCompleted).to.equal(true);

// 5. Compute and publish results
await contract.connect(researcher).computeAggregatedResults(1);
await contract.connect(researcher).publishResults(1);
```

## Querying Study Information

### Get Study Details

```typescript
const studyInfo = await contract.getStudyInfo(studyId);
// Returns: title, description, dataCollectionActive, studyCompleted,
//          resultsPublished, participantCount, targetParticipants
```

### List Study Participants

```typescript
const participants = await contract.getStudyParticipants(studyId);
// Only authorized researchers can call this function
```

---

**Key Takeaway**: Studies provide a structured workflow for managing the complete research lifecycle, from creation through data collection to result analysis.
