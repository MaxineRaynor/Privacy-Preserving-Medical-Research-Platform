// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialMedicalResearch is SepoliaConfig {

    address public researchCoordinator;
    uint32 public currentStudyId;
    uint256 public lastStudyTime;

    struct PatientData {
        euint8 encryptedAge;
        euint8 encryptedSymptomScore;
        euint8 encryptedTreatmentResponse;
        bool hasSubmitted;
        uint256 submissionTime;
        address patientAddress;
    }

    struct MedicalStudy {
        uint32 studyId;
        string studyTitle;
        string description;
        bool dataCollectionActive;
        bool studyCompleted;
        bool resultsPublished;
        uint256 startTime;
        uint256 endTime;
        uint256 targetParticipants;
        address[] participants;
        euint32 aggregatedResults;
        bool hasAggregatedData;
    }

    mapping(uint32 => MedicalStudy) public medicalStudies;
    mapping(uint32 => mapping(address => PatientData)) public patientSubmissions;
    mapping(address => bool) public authorizedResearchers;
    mapping(address => bool) public verifiedPatients;

    event StudyCreated(uint32 indexed studyId, string title, uint256 startTime);
    event PatientDataSubmitted(address indexed patient, uint32 indexed studyId);
    event StudyCompleted(uint32 indexed studyId, uint256 participantCount);
    event ResultsPublished(uint32 indexed studyId, uint256 timestamp);
    event PatientVerified(address indexed patient);
    event ResearcherAuthorized(address indexed researcher);

    modifier onlyCoordinator() {
        require(msg.sender == researchCoordinator, "Not authorized coordinator");
        _;
    }

    modifier onlyAuthorizedResearcher() {
        require(authorizedResearchers[msg.sender] || msg.sender == researchCoordinator, "Not authorized researcher");
        _;
    }

    modifier onlyVerifiedPatient() {
        require(verifiedPatients[msg.sender], "Patient not verified");
        _;
    }

    modifier onlyDuringDataCollection(uint32 _studyId) {
        require(medicalStudies[_studyId].dataCollectionActive, "Data collection not active");
        require(!medicalStudies[_studyId].studyCompleted, "Study already completed");
        _;
    }

    constructor() {
        researchCoordinator = msg.sender;
        currentStudyId = 1;
        lastStudyTime = block.timestamp;
        authorizedResearchers[msg.sender] = true;
    }

    function authorizeResearcher(address _researcher) external onlyCoordinator {
        authorizedResearchers[_researcher] = true;
        emit ResearcherAuthorized(_researcher);
    }

    function verifyPatient(address _patient) external onlyAuthorizedResearcher {
        verifiedPatients[_patient] = true;
        emit PatientVerified(_patient);
    }

    function createMedicalStudy(
        string memory _title,
        string memory _description,
        uint256 _targetParticipants
    ) external onlyAuthorizedResearcher {
        require(_targetParticipants > 0, "Target participants must be greater than 0");
        require(bytes(_title).length > 0, "Study title required");

        medicalStudies[currentStudyId] = MedicalStudy({
            studyId: currentStudyId,
            studyTitle: _title,
            description: _description,
            dataCollectionActive: true,
            studyCompleted: false,
            resultsPublished: false,
            startTime: block.timestamp,
            endTime: 0,
            targetParticipants: _targetParticipants,
            participants: new address[](0),
            aggregatedResults: FHE.asEuint32(0),
            hasAggregatedData: false
        });

        emit StudyCreated(currentStudyId, _title, block.timestamp);
        currentStudyId++;
    }

    function submitPatientData(
        uint32 _studyId,
        uint8 _age,
        uint8 _symptomScore,
        uint8 _treatmentResponse
    ) external onlyVerifiedPatient onlyDuringDataCollection(_studyId) {
        require(_age > 0 && _age <= 120, "Invalid age range");
        require(_symptomScore <= 100, "Symptom score must be 0-100");
        require(_treatmentResponse <= 100, "Treatment response must be 0-100");
        require(!patientSubmissions[_studyId][msg.sender].hasSubmitted, "Already submitted data for this study");

        euint8 encryptedAge = FHE.asEuint8(_age);
        euint8 encryptedSymptomScore = FHE.asEuint8(_symptomScore);
        euint8 encryptedTreatmentResponse = FHE.asEuint8(_treatmentResponse);

        patientSubmissions[_studyId][msg.sender] = PatientData({
            encryptedAge: encryptedAge,
            encryptedSymptomScore: encryptedSymptomScore,
            encryptedTreatmentResponse: encryptedTreatmentResponse,
            hasSubmitted: true,
            submissionTime: block.timestamp,
            patientAddress: msg.sender
        });

        medicalStudies[_studyId].participants.push(msg.sender);

        FHE.allowThis(encryptedAge);
        FHE.allowThis(encryptedSymptomScore);
        FHE.allowThis(encryptedTreatmentResponse);
        FHE.allow(encryptedAge, msg.sender);
        FHE.allow(encryptedSymptomScore, msg.sender);
        FHE.allow(encryptedTreatmentResponse, msg.sender);

        emit PatientDataSubmitted(msg.sender, _studyId);

        if (medicalStudies[_studyId].participants.length >= medicalStudies[_studyId].targetParticipants) {
            _completeStudy(_studyId);
        }
    }

    function completeStudyManually(uint32 _studyId) external onlyAuthorizedResearcher {
        require(medicalStudies[_studyId].dataCollectionActive, "Study not active");
        require(!medicalStudies[_studyId].studyCompleted, "Study already completed");
        _completeStudy(_studyId);
    }

    function _completeStudy(uint32 _studyId) private {
        MedicalStudy storage study = medicalStudies[_studyId];
        study.dataCollectionActive = false;
        study.studyCompleted = true;
        study.endTime = block.timestamp;

        emit StudyCompleted(_studyId, study.participants.length);
    }

    function computeAggregatedResults(uint32 _studyId) external onlyAuthorizedResearcher {
        require(medicalStudies[_studyId].studyCompleted, "Study not completed");
        require(!medicalStudies[_studyId].hasAggregatedData, "Results already computed");

        MedicalStudy storage study = medicalStudies[_studyId];

        bytes32[] memory cts = new bytes32[](study.participants.length * 3);
        uint256 index = 0;

        for (uint i = 0; i < study.participants.length; i++) {
            address participant = study.participants[i];
            PatientData storage data = patientSubmissions[_studyId][participant];

            cts[index] = FHE.toBytes32(data.encryptedAge);
            cts[index + 1] = FHE.toBytes32(data.encryptedSymptomScore);
            cts[index + 2] = FHE.toBytes32(data.encryptedTreatmentResponse);
            index += 3;
        }

        FHE.requestDecryption(cts, this.processAggregatedResults.selector);
    }

    function processAggregatedResults(
        uint256 requestId,
        bytes memory decryptedValues,
        bytes memory signatures
    ) external {
        FHE.checkSignatures(requestId, decryptedValues, signatures);

        // Decode the decrypted values
        uint8[] memory values = abi.decode(decryptedValues, (uint8[]));

        uint256 totalAge = 0;
        uint256 totalSymptomScore = 0;
        uint256 totalTreatmentResponse = 0;
        uint256 participantCount = values.length / 3;

        for (uint i = 0; i < values.length; i += 3) {
            totalAge += values[i];
            totalSymptomScore += values[i + 1];
            totalTreatmentResponse += values[i + 2];
        }

        uint32 avgAge = uint32(totalAge / participantCount);
        uint32 avgSymptomScore = uint32(totalSymptomScore / participantCount);
        uint32 avgTreatmentResponse = uint32(totalTreatmentResponse / participantCount);

        uint32 studyId = currentStudyId - 1;
        medicalStudies[studyId].aggregatedResults = FHE.asEuint32(
            (avgAge << 16) | (avgSymptomScore << 8) | avgTreatmentResponse
        );
        medicalStudies[studyId].hasAggregatedData = true;
    }

    function publishResults(uint32 _studyId) external onlyAuthorizedResearcher {
        require(medicalStudies[_studyId].studyCompleted, "Study not completed");
        require(medicalStudies[_studyId].hasAggregatedData, "Aggregated data not computed");
        require(!medicalStudies[_studyId].resultsPublished, "Results already published");

        medicalStudies[_studyId].resultsPublished = true;
        emit ResultsPublished(_studyId, block.timestamp);
    }

    function getStudyInfo(uint32 _studyId) external view returns (
        string memory title,
        string memory description,
        bool dataCollectionActive,
        bool studyCompleted,
        bool resultsPublished,
        uint256 participantCount,
        uint256 targetParticipants
    ) {
        MedicalStudy storage study = medicalStudies[_studyId];
        return (
            study.studyTitle,
            study.description,
            study.dataCollectionActive,
            study.studyCompleted,
            study.resultsPublished,
            study.participants.length,
            study.targetParticipants
        );
    }

    function getPatientSubmissionStatus(uint32 _studyId, address _patient) external view returns (
        bool hasSubmitted,
        uint256 submissionTime
    ) {
        PatientData storage submission = patientSubmissions[_studyId][_patient];
        return (submission.hasSubmitted, submission.submissionTime);
    }

    function getCurrentStudyId() external view returns (uint32) {
        return currentStudyId;
    }

    function isPatientVerified(address _patient) external view returns (bool) {
        return verifiedPatients[_patient];
    }

    function isResearcherAuthorized(address _researcher) external view returns (bool) {
        return authorizedResearchers[_researcher];
    }

    function getStudyParticipants(uint32 _studyId) external view onlyAuthorizedResearcher returns (address[] memory) {
        return medicalStudies[_studyId].participants;
    }
}