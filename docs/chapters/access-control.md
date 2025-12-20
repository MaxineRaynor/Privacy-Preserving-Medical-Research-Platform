# Access Control

This chapter demonstrates FHEVM access control patterns and role-based permissions.

Understanding access control is crucial for building secure confidential applications.

## Role-Based Access Model

The contract implements a three-tier access control system:

1. **Coordinator**: Can authorize researchers, verify patients, create studies, and perform all researcher actions
2. **Researcher**: Can create studies, verify patients, and manage study lifecycle
3. **Patient**: Can submit encrypted medical data to studies after verification

## Researcher Authorization

Only the coordinator can authorize new researchers. This demonstrates:
- Role-based access control
- Event emission for authorization tracking
- Proper permission checks

### Example

```typescript
await contract.authorizeResearcher(researcherAddress);
expect(await contract.isResearcherAuthorized(researcherAddress)).to.equal(true);
```

## Patient Verification Workflow

Authorized researchers can verify patients. This shows:
- Delegated permission model
- Patient verification workflow
- Event-based tracking

### Example

```typescript
await contract.connect(researcher).verifyPatient(patientAddress);
expect(await contract.isPatientVerified(patientAddress)).to.equal(true);
```

## FHE Access Control Patterns

### Using FHE.allowThis()

Grants the contract permission to use encrypted values:

```solidity
euint8 encrypted = FHE.asEuint8(value);
FHE.allowThis(encrypted);  // Contract can now use this value
```

### Using FHE.allow()

Grants specific addresses permission to access encrypted data:

```solidity
FHE.allow(encrypted, patientAddress);  // Patient can decrypt if needed
```

## Anti-Patterns to Avoid

### ❌ Unauthorized Operations

Attempting privileged operations without proper authorization:

```typescript
// This fails
await contract.connect(unauthorized).authorizeResearcher(researcherAddress);
// Error: "Not authorized coordinator"
```

### ❌ Unauthorized Data Access

Only verified patients can submit data:

```typescript
// This fails
await contract.connect(unverifiedPatient).submitPatientData(1, 45, 75, 60);
// Error: "Patient not verified"
```

### ✅ Proper Authorization Flow

```typescript
// 1. Authorize researcher
await contract.authorizeResearcher(researcherAddress);

// 2. Researcher verifies patient
await contract.connect(researcher).verifyPatient(patientAddress);

// 3. Verified patient can submit data
await contract.connect(patient).submitPatientData(1, 45, 75, 60);
```

## Access Control Modifiers

The contract uses custom modifiers for access enforcement:

- `onlyCoordinator()` - Restricts to coordinator only
- `onlyAuthorizedResearcher()` - Restricts to authorized researchers (includes coordinator)
- `onlyVerifiedPatient()` - Restricts to verified patients
- `onlyDuringDataCollection()` - Restricts to active data collection phase

---

**Key Takeaway**: Proper access control is essential for protecting encrypted data and maintaining the integrity of medical research.
