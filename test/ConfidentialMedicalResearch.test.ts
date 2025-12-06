import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialMedicalResearch } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

/**
 * # Confidential Medical Research - Comprehensive Test Suite
 *
 * This test suite demonstrates the complete functionality of a privacy-preserving
 * medical research platform built with FHEVM (Fully Homomorphic Encryption Virtual Machine).
 *
 * ## Key FHEVM Concepts Demonstrated:
 * - **Encryption**: Patient data is encrypted using FHE before storage
 * - **Access Control**: FHE.allow and FHE.allowThis control who can access encrypted data
 * - **Public Decryption**: Aggregated results use FHE.requestDecryption for research insights
 * - **Privacy Preservation**: Individual patient data remains encrypted while enabling analysis
 *
 * chapter: medical-research
 * category: healthcare
 */
describe("ConfidentialMedicalResearch", function () {
  let contract: ConfidentialMedicalResearch;
  let coordinator: SignerWithAddress;
  let researcher: SignerWithAddress;
  let patient1: SignerWithAddress;
  let patient2: SignerWithAddress;
  let patient3: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  /**
   * ## Deployment Fixture
   *
   * This fixture deploys the contract once and reuses it for all tests,
   * improving test performance. The coordinator is automatically set as
   * the deployer and granted researcher privileges.
   *
   * chapter: setup
   */
  async function deployContractFixture() {
    const [coord, res, p1, p2, p3, unauth] = await ethers.getSigners();

    const ContractFactory = await ethers.getContractFactory(
      "ConfidentialMedicalResearch"
    );
    const deployedContract =
      (await ContractFactory.deploy()) as ConfidentialMedicalResearch;

    return {
      contract: deployedContract,
      coordinator: coord,
      researcher: res,
      patient1: p1,
      patient2: p2,
      patient3: p3,
      unauthorized: unauth,
    };
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployContractFixture);
    contract = fixture.contract;
    coordinator = fixture.coordinator;
    researcher = fixture.researcher;
    patient1 = fixture.patient1;
    patient2 = fixture.patient2;
    patient3 = fixture.patient3;
    unauthorized = fixture.unauthorized;
  });

  /**
   * # Contract Deployment Tests
   *
   * These tests verify proper initialization of the contract state.
   *
   * chapter: setup
   */
  describe("Deployment", function () {
    /**
     * ## Initial State Verification
     *
     * Verifies that the contract initializes with correct default values:
     * - Coordinator is set to deployer
     * - Study ID counter starts at 1
     * - Coordinator is automatically authorized as researcher
     */
    it("Should set the correct initial state", async function () {
      expect(await contract.researchCoordinator()).to.equal(
        coordinator.address
      );
      expect(await contract.currentStudyId()).to.equal(1);
      expect(
        await contract.isResearcherAuthorized(coordinator.address)
      ).to.equal(true);
    });

    /**
     * ## Timestamp Validation
     *
     * Ensures the contract records deployment time correctly.
     */
    it("Should record the deployment time", async function () {
      const lastStudyTime = await contract.lastStudyTime();
      expect(lastStudyTime).to.be.gt(0);
    });
  });

  /**
   * # Access Control Tests
   *
   * These tests demonstrate FHEVM access control patterns and role-based permissions.
   * Understanding access control is crucial for building secure confidential applications.
   *
   * chapter: access-control
   */
  describe("Access Control", function () {
    /**
     * ## Researcher Authorization
     *
     * Only the coordinator can authorize new researchers. This test demonstrates:
     * - Role-based access control
     * - Event emission for authorization tracking
     * - Proper permission checks
     */
    it("Should allow coordinator to authorize researchers", async function () {
      await expect(contract.authorizeResearcher(researcher.address))
        .to.emit(contract, "ResearcherAuthorized")
        .withArgs(researcher.address);

      expect(
        await contract.isResearcherAuthorized(researcher.address)
      ).to.equal(true);
    });

    /**
     * ## Unauthorized Researcher Authorization Attempt
     *
     * This test demonstrates a common anti-pattern: attempting privileged operations
     * without proper authorization. This should fail with a clear error message.
     */
    it("Should prevent unauthorized users from authorizing researchers", async function () {
      await expect(
        contract
          .connect(unauthorized)
          .authorizeResearcher(researcher.address)
      ).to.be.revertedWith("Not authorized coordinator");
    });

    /**
     * ## Patient Verification by Researcher
     *
     * Authorized researchers can verify patients. This test shows:
     * - Delegated permission model
     * - Patient verification workflow
     * - Event-based tracking
     */
    it("Should allow authorized researchers to verify patients", async function () {
      await contract.authorizeResearcher(researcher.address);

      await expect(
        contract.connect(researcher).verifyPatient(patient1.address)
      )
        .to.emit(contract, "PatientVerified")
        .withArgs(patient1.address);

      expect(await contract.isPatientVerified(patient1.address)).to.equal(
        true
      );
    });

    /**
     * ## Coordinator Can Verify Patients
     *
     * The coordinator has all researcher permissions by default.
     */
    it("Should allow coordinator to verify patients directly", async function () {
      await expect(contract.verifyPatient(patient1.address))
        .to.emit(contract, "PatientVerified")
        .withArgs(patient1.address);

      expect(await contract.isPatientVerified(patient1.address)).to.equal(
        true
      );
    });

    /**
     * ## Anti-Pattern: Unauthorized Patient Verification
     *
     * Unauthorized users cannot verify patients. This demonstrates proper
     * access control enforcement.
     */
    it("Should prevent unauthorized users from verifying patients", async function () {
      await expect(
        contract.connect(unauthorized).verifyPatient(patient1.address)
      ).to.be.revertedWith("Not authorized researcher");
    });
  });

  /**
   * # Medical Study Creation Tests
   *
   * These tests demonstrate how to create and manage encrypted medical research studies.
   *
   * chapter: study-management
   */
  describe("Medical Study Creation", function () {
    beforeEach(async function () {
      await contract.authorizeResearcher(researcher.address);
    });

    /**
     * ## Creating a Valid Medical Study
     *
     * This test shows the complete study creation workflow:
     * 1. Researcher creates study with title, description, and target participants
     * 2. Study is assigned a unique ID
     * 3. Event is emitted for tracking
     * 4. Study state is initialized correctly
     */
    it("Should create a medical study with valid parameters", async function () {
      const title = "COVID-19 Treatment Response Study";
      const description =
        "Analyzing patient responses to various COVID-19 treatments";
      const targetParticipants = 100;

      await expect(
        contract
          .connect(researcher)
          .createMedicalStudy(title, description, targetParticipants)
      )
        .to.emit(contract, "StudyCreated")
        .withArgs(1, title, await ethers.provider.getBlock("latest").then(b => b ? b.timestamp + 1 : 0));

      const studyInfo = await contract.getStudyInfo(1);
      expect(studyInfo.title).to.equal(title);
      expect(studyInfo.description).to.equal(description);
      expect(studyInfo.dataCollectionActive).to.equal(true);
      expect(studyInfo.studyCompleted).to.equal(false);
      expect(studyInfo.targetParticipants).to.equal(targetParticipants);
    });

    /**
     * ## Study ID Auto-Increment
     *
     * Studies are automatically assigned sequential IDs.
     */
    it("Should increment study ID for each new study", async function () {
      await contract
        .connect(researcher)
        .createMedicalStudy("Study 1", "Description 1", 10);
      await contract
        .connect(researcher)
        .createMedicalStudy("Study 2", "Description 2", 20);

      expect(await contract.getCurrentStudyId()).to.equal(3); // Next ID will be 3
    });

    /**
     * ## Anti-Pattern: Empty Study Title
     *
     * Study creation requires a non-empty title. This test demonstrates
     * proper input validation.
     */
    it("Should reject study creation with empty title", async function () {
      await expect(
        contract.connect(researcher).createMedicalStudy("", "Description", 10)
      ).to.be.revertedWith("Study title required");
    });

    /**
     * ## Anti-Pattern: Zero Target Participants
     *
     * Studies must have at least one target participant.
     */
    it("Should reject study creation with zero target participants", async function () {
      await expect(
        contract
          .connect(researcher)
          .createMedicalStudy("Study", "Description", 0)
      ).to.be.revertedWith("Target participants must be greater than 0");
    });

    /**
     * ## Anti-Pattern: Unauthorized Study Creation
     *
     * Only authorized researchers can create studies.
     */
    it("Should prevent unauthorized users from creating studies", async function () {
      await expect(
        contract
          .connect(unauthorized)
          .createMedicalStudy("Study", "Description", 10)
      ).to.be.revertedWith("Not authorized researcher");
    });
  });

  /**
   * # Encrypted Patient Data Submission Tests
   *
   * These tests demonstrate the core FHEVM encryption functionality for patient data.
   * Patient medical information is encrypted on-chain, ensuring privacy while enabling research.
   *
   * ## Key FHEVM Concepts:
   * - **FHE.asEuint8()**: Encrypts uint8 values (age, scores)
   * - **FHE.allowThis()**: Grants contract permission to access encrypted data
   * - **FHE.allow()**: Grants specific address permission to access encrypted data
   *
   * chapter: encryption
   * chapter: patient-data
   */
  describe("Patient Data Submission", function () {
    beforeEach(async function () {
      await contract.authorizeResearcher(researcher.address);
      await contract
        .connect(researcher)
        .createMedicalStudy("Test Study", "Test Description", 3);
      await contract.connect(researcher).verifyPatient(patient1.address);
    });

    /**
     * ## Successful Encrypted Data Submission
     *
     * This test demonstrates:
     * 1. Patient submits encrypted medical data (age, symptom score, treatment response)
     * 2. Data is encrypted using FHE.asEuint8()
     * 3. Access permissions are set with FHE.allow() and FHE.allowThis()
     * 4. Patient is added to study participants
     * 5. Event is emitted for tracking
     */
    it("Should allow verified patients to submit encrypted data", async function () {
      const age = 45;
      const symptomScore = 75;
      const treatmentResponse = 60;

      await expect(
        contract
          .connect(patient1)
          .submitPatientData(1, age, symptomScore, treatmentResponse)
      )
        .to.emit(contract, "PatientDataSubmitted")
        .withArgs(patient1.address, 1);

      const submission = await contract.getPatientSubmissionStatus(
        1,
        patient1.address
      );
      expect(submission.hasSubmitted).to.equal(true);

      const studyInfo = await contract.getStudyInfo(1);
      expect(studyInfo.participantCount).to.equal(1);
    });

    /**
     * ## Anti-Pattern: Unverified Patient Submission
     *
     * Patients must be verified before submitting data. This ensures only
     * legitimate participants contribute to research.
     */
    it("Should prevent unverified patients from submitting data", async function () {
      await expect(
        contract.connect(patient2).submitPatientData(1, 45, 75, 60)
      ).to.be.revertedWith("Patient not verified");
    });

    /**
     * ## Anti-Pattern: Invalid Age Range
     *
     * Age must be between 1 and 120 to ensure data quality.
     */
    it("Should reject invalid age values", async function () {
      await expect(
        contract.connect(patient1).submitPatientData(1, 0, 75, 60)
      ).to.be.revertedWith("Invalid age range");

      await expect(
        contract.connect(patient1).submitPatientData(1, 121, 75, 60)
      ).to.be.revertedWith("Invalid age range");
    });

    /**
     * ## Anti-Pattern: Invalid Symptom Score
     *
     * Symptom scores must be 0-100.
     */
    it("Should reject symptom scores above 100", async function () {
      await expect(
        contract.connect(patient1).submitPatientData(1, 45, 101, 60)
      ).to.be.revertedWith("Symptom score must be 0-100");
    });

    /**
     * ## Anti-Pattern: Invalid Treatment Response
     *
     * Treatment response must be 0-100.
     */
    it("Should reject treatment response above 100", async function () {
      await expect(
        contract.connect(patient1).submitPatientData(1, 45, 75, 101)
      ).to.be.revertedWith("Treatment response must be 0-100");
    });

    /**
     * ## Anti-Pattern: Duplicate Submission
     *
     * Patients can only submit data once per study to prevent data manipulation.
     */
    it("Should prevent duplicate submissions from same patient", async function () {
      await contract
        .connect(patient1)
        .submitPatientData(1, 45, 75, 60);

      await expect(
        contract.connect(patient1).submitPatientData(1, 50, 80, 65)
      ).to.be.revertedWith("Already submitted data for this study");
    });

    /**
     * ## Anti-Pattern: Submission to Inactive Study
     *
     * Patients cannot submit data after a study is completed.
     */
    it("Should prevent submission after study completion", async function () {
      await contract
        .connect(researcher)
        .completeStudyManually(1);

      await expect(
        contract.connect(patient1).submitPatientData(1, 45, 75, 60)
      ).to.be.revertedWith("Data collection not active");
    });

    /**
     * ## Automatic Study Completion
     *
     * When target participant count is reached, study automatically completes.
     * This test demonstrates workflow automation.
     */
    it("Should auto-complete study when target is reached", async function () {
      await contract.connect(researcher).verifyPatient(patient2.address);
      await contract.connect(researcher).verifyPatient(patient3.address);

      await contract.connect(patient1).submitPatientData(1, 45, 75, 60);
      await contract.connect(patient2).submitPatientData(1, 50, 80, 65);

      await expect(
        contract.connect(patient3).submitPatientData(1, 55, 70, 70)
      ).to.emit(contract, "StudyCompleted");

      const studyInfo = await contract.getStudyInfo(1);
      expect(studyInfo.studyCompleted).to.equal(true);
      expect(studyInfo.dataCollectionActive).to.equal(false);
    });
  });

  /**
   * # Study Management Tests
   *
   * These tests cover study lifecycle management including manual completion.
   *
   * chapter: study-management
   */
  describe("Study Completion", function () {
    beforeEach(async function () {
      await contract.authorizeResearcher(researcher.address);
      await contract
        .connect(researcher)
        .createMedicalStudy("Test Study", "Description", 10);
    });

    /**
     * ## Manual Study Completion
     *
     * Researchers can manually complete a study before reaching the target
     * participant count if necessary.
     */
    it("Should allow researcher to manually complete study", async function () {
      await expect(contract.connect(researcher).completeStudyManually(1))
        .to.emit(contract, "StudyCompleted")
        .withArgs(1, 0);

      const studyInfo = await contract.getStudyInfo(1);
      expect(studyInfo.studyCompleted).to.equal(true);
      expect(studyInfo.dataCollectionActive).to.equal(false);
    });

    /**
     * ## Anti-Pattern: Duplicate Study Completion
     *
     * Cannot complete an already completed study.
     */
    it("Should prevent completing an already completed study", async function () {
      await contract.connect(researcher).completeStudyManually(1);

      await expect(
        contract.connect(researcher).completeStudyManually(1)
      ).to.be.revertedWith("Study already completed");
    });

    /**
     * ## Anti-Pattern: Unauthorized Study Completion
     *
     * Only authorized researchers can complete studies.
     */
    it("Should prevent unauthorized users from completing studies", async function () {
      await expect(
        contract.connect(unauthorized).completeStudyManually(1)
      ).to.be.revertedWith("Not authorized researcher");
    });
  });

  /**
   * # View Function Tests
   *
   * These tests verify the query functions for retrieving study and patient information.
   *
   * chapter: queries
   */
  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.authorizeResearcher(researcher.address);
      await contract
        .connect(researcher)
        .createMedicalStudy("Test Study", "Description", 5);
      await contract.connect(researcher).verifyPatient(patient1.address);
      await contract.connect(patient1).submitPatientData(1, 45, 75, 60);
    });

    /**
     * ## Study Information Retrieval
     *
     * Anyone can query public study information (not encrypted patient data).
     */
    it("Should return complete study information", async function () {
      const studyInfo = await contract.getStudyInfo(1);

      expect(studyInfo.title).to.equal("Test Study");
      expect(studyInfo.description).to.equal("Description");
      expect(studyInfo.dataCollectionActive).to.equal(true);
      expect(studyInfo.studyCompleted).to.equal(false);
      expect(studyInfo.participantCount).to.equal(1);
      expect(studyInfo.targetParticipants).to.equal(5);
    });

    /**
     * ## Patient Submission Status
     *
     * Check if a patient has submitted data to a specific study.
     */
    it("Should return patient submission status", async function () {
      const status = await contract.getPatientSubmissionStatus(
        1,
        patient1.address
      );

      expect(status.hasSubmitted).to.equal(true);
      expect(status.submissionTime).to.be.gt(0);
    });

    /**
     * ## Current Study ID
     *
     * Get the next study ID that will be assigned.
     */
    it("Should return current study ID", async function () {
      expect(await contract.getCurrentStudyId()).to.equal(2);
    });

    /**
     * ## Patient Verification Status
     *
     * Check if an address is a verified patient.
     */
    it("Should check patient verification status", async function () {
      expect(await contract.isPatientVerified(patient1.address)).to.equal(
        true
      );
      expect(await contract.isPatientVerified(patient2.address)).to.equal(
        false
      );
    });

    /**
     * ## Researcher Authorization Status
     *
     * Check if an address is an authorized researcher.
     */
    it("Should check researcher authorization status", async function () {
      expect(
        await contract.isResearcherAuthorized(researcher.address)
      ).to.equal(true);
      expect(
        await contract.isResearcherAuthorized(unauthorized.address)
      ).to.equal(false);
    });

    /**
     * ## Study Participants List
     *
     * Authorized researchers can view the list of study participants.
     * This is restricted to maintain participant privacy.
     */
    it("Should return study participants for authorized researchers", async function () {
      const participants = await contract
        .connect(researcher)
        .getStudyParticipants(1);

      expect(participants.length).to.equal(1);
      expect(participants[0]).to.equal(patient1.address);
    });

    /**
     * ## Anti-Pattern: Unauthorized Participant List Access
     *
     * Unauthorized users cannot view participant lists.
     */
    it("Should prevent unauthorized access to participant lists", async function () {
      await expect(
        contract.connect(unauthorized).getStudyParticipants(1)
      ).to.be.revertedWith("Not authorized researcher");
    });
  });

  /**
   * # Multi-Study Workflow Test
   *
   * This test demonstrates a complete real-world workflow with multiple studies
   * and participants, showing how the system handles complex scenarios.
   *
   * chapter: integration
   */
  describe("Complete Workflow Integration", function () {
    /**
     * ## End-to-End Medical Research Workflow
     *
     * This integration test demonstrates:
     * 1. Setting up researchers and patients
     * 2. Creating multiple research studies
     * 3. Patients participating in different studies
     * 4. Study completion and management
     *
     * This represents a realistic medical research platform workflow.
     */
    it("Should handle complete medical research workflow", async function () {
      // Setup: Authorize researcher and verify patients
      await contract.authorizeResearcher(researcher.address);
      await contract.connect(researcher).verifyPatient(patient1.address);
      await contract.connect(researcher).verifyPatient(patient2.address);

      // Create multiple studies
      await contract
        .connect(researcher)
        .createMedicalStudy(
          "Hypertension Treatment Study",
          "Comparing blood pressure medications",
          2
        );

      await contract
        .connect(researcher)
        .createMedicalStudy(
          "Diabetes Management Study",
          "Analyzing glucose control methods",
          2
        );

      // Patients submit data to different studies
      await contract.connect(patient1).submitPatientData(1, 60, 85, 70);
      await contract.connect(patient1).submitPatientData(2, 60, 80, 75);
      await contract.connect(patient2).submitPatientData(1, 55, 90, 65);

      // Verify study states
      const study1 = await contract.getStudyInfo(1);
      expect(study1.studyCompleted).to.equal(true); // Auto-completed
      expect(study1.participantCount).to.equal(2);

      const study2 = await contract.getStudyInfo(2);
      expect(study2.studyCompleted).to.equal(false); // Still active
      expect(study2.participantCount).to.equal(1);

      // Manual completion of second study
      await contract.connect(researcher).completeStudyManually(2);

      const study2Updated = await contract.getStudyInfo(2);
      expect(study2Updated.studyCompleted).to.equal(true);
    });
  });
});
