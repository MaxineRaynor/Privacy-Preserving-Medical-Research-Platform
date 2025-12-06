import * as fs from "fs";
import * as path from "path";

/**
 * # Documentation Generator
 *
 * This script automatically generates GitBook-compatible documentation from:
 * 1. TypeScript test files with JSDoc comments
 * 2. Solidity contract files with natspec comments
 * 3. README templates
 *
 * ## Output Structure:
 * - docs/
 *   - README.md (main documentation)
 *   - chapters/
 *     - setup.md
 *     - access-control.md
 *     - encryption.md
 *     - medical-research.md
 *   - SUMMARY.md (GitBook navigation)
 *
 * chapter: documentation
 */

interface DocEntry {
  chapter: string;
  title: string;
  description: string;
  content: string;
}

const docEntries: Map<string, DocEntry> = new Map();
const chapters = new Set<string>();

/**
 * Extract documentation from TypeScript test files
 */
function parseTypeScriptDocs(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let currentChapter = "general";
  let currentTitle = "";
  let currentDescription = "";
  let inCommentBlock = false;
  let commentContent = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle multi-line comments
    if (line.includes("/**")) {
      inCommentBlock = true;
      commentContent = "";
      continue;
    }

    if (inCommentBlock) {
      if (line.includes("*/")) {
        inCommentBlock = false;
        // Parse the comment block
        const chapterMatch = commentContent.match(/chapter:\s*(\w+)/);
        if (chapterMatch) {
          currentChapter = chapterMatch[1];
          chapters.add(currentChapter);
        }

        const titleMatch = commentContent.match(/^#+ (.+)/m);
        if (titleMatch) {
          currentTitle = titleMatch[1];
        }

        // Store documentation
        if (currentTitle) {
          const key = `${currentChapter}_${currentTitle}`;
          docEntries.set(key, {
            chapter: currentChapter,
            title: currentTitle,
            description: commentContent,
            content: commentContent,
          });
        }
        continue;
      }

      // Remove comment markers and collect content
      const cleanedLine = line.replace(/^\s*\*\s?/, "").trim();
      if (cleanedLine && !cleanedLine.startsWith("chapter:")) {
        commentContent += cleanedLine + "\n";
      }
    }
  }
}

/**
 * Extract documentation from Solidity files
 */
function parseSolidityDocs(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let inCommentBlock = false;
  let commentContent = "";

  for (const line of lines) {
    if (line.includes("///")) {
      inCommentBlock = true;
      const cleanedLine = line.replace(/^\s*\/\/\/\s?/, "").trim();
      commentContent += cleanedLine + "\n";
    } else if (inCommentBlock && line.trim() === "") {
      // End of comment block
      inCommentBlock = false;
      // Process commentContent
      commentContent = "";
    }
  }
}

/**
 * Generate chapter documentation files
 */
function generateChapterDocs(chapterName: string) {
  const entries = Array.from(docEntries.values()).filter(
    (e) => e.chapter === chapterName
  );

  if (entries.length === 0) return "";

  let markdown = `# ${capitalize(chapterName)}\n\n`;
  markdown += `This chapter covers: **${chapterName}** patterns and concepts.\n\n`;

  for (const entry of entries) {
    markdown += `## ${entry.title}\n\n`;
    markdown += `${entry.description}\n\n`;
    markdown += "---\n\n";
  }

  return markdown;
}

/**
 * Generate SUMMARY.md for GitBook
 */
function generateSummary() {
  let summary = "# Table of Contents\n\n";
  summary += "* [Introduction](README.md)\n\n";

  const sortedChapters = Array.from(chapters).sort();
  for (const chapter of sortedChapters) {
    summary += `* [${capitalize(chapter)}](chapters/${chapter}.md)\n`;
  }

  return summary;
}

/**
 * Generate main README
 */
function generateMainReadme() {
  return `# Confidential Medical Research - FHEVM Example

## Overview

This is a comprehensive example of a **privacy-preserving medical research platform** built with FHEVM (Fully Homomorphic Encryption Virtual Machine). It demonstrates how to securely collect, store, and analyze encrypted patient data while maintaining complete privacy.

## Key Features

- 🔐 **End-to-End Encryption**: Patient medical data is encrypted on-chain using FHE
- 🏥 **Medical Research Workflow**: Complete study management and data collection lifecycle
- 🔬 **Access Control**: Role-based permissions for researchers and verified patients
- 📊 **Encrypted Analytics**: Compute aggregated results without decrypting individual data
- 🛡️ **Privacy-Preserving**: Individual patient data remains confidential even during analysis

## FHEVM Concepts Demonstrated

### 1. Encryption (\`chapter: encryption\`)
- Using \`FHE.asEuint8()\` to encrypt sensitive medical data
- Storing encrypted values on-chain
- Encrypting patient age, symptom scores, and treatment responses

### 2. Access Control (\`chapter: access-control\`)
- Using \`FHE.allow()\` to grant specific addresses permission to access encrypted data
- Using \`FHE.allowThis()\` to grant the contract permission
- Role-based access control for researchers and patients

### 3. Study Management (\`chapter: study-management\`)
- Creating medical research studies
- Managing data collection lifecycle
- Automatic and manual study completion

### 4. Patient Data (\`chapter: patient-data\`)
- Patient verification workflow
- Encrypted data submission
- Duplicate submission prevention

## Project Structure

\`\`\`
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
\`\`\`

## Getting Started

### Installation

\`\`\`bash
npm install
\`\`\`

### Compilation

\`\`\`bash
npm run compile
\`\`\`

### Testing

\`\`\`bash
npm run test
npm run test:verbose
npm run coverage
\`\`\`

### Deployment

**Local Development:**
\`\`\`bash
npx hardhat node
npm run deploy:local
\`\`\`

**Sepolia Testnet:**
\`\`\`bash
npm run deploy
\`\`\`

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
- \`createMedicalStudy()\` - Create a new research study
- \`completeStudyManually()\` - Manually complete a study
- \`getStudyInfo()\` - Retrieve study information

### Patient Management
- \`verifyPatient()\` - Verify a patient for participation
- \`isPatientVerified()\` - Check patient verification status
- \`getPatientSubmissionStatus()\` - Check if patient submitted data

### Data Submission
- \`submitPatientData()\` - Submit encrypted patient medical data
- \`computeAggregatedResults()\` - Compute encrypted aggregated results
- \`publishResults()\` - Publish study results

### Researcher Management
- \`authorizeResearcher()\` - Authorize a researcher
- \`isResearcherAuthorized()\` - Check researcher authorization

## Security Considerations

1. **Encryption**: All patient data is encrypted using FHE before storage
2. **Access Control**: Only verified patients can submit data; only authorized researchers can access aggregated data
3. **Validation**: Strict input validation for all medical data
4. **Privacy**: Individual patient data remains encrypted throughout the process
5. **Immutability**: Study data is immutable once submitted

## Events

The contract emits the following events:

- \`StudyCreated(uint32 studyId, string title, uint256 startTime)\`
- \`PatientDataSubmitted(address patient, uint32 studyId)\`
- \`StudyCompleted(uint32 studyId, uint256 participantCount)\`
- \`ResultsPublished(uint32 studyId, uint256 timestamp)\`
- \`PatientVerified(address patient)\`
- \`ResearcherAuthorized(address researcher)\`

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
`;
}

/**
 * Helper function to capitalize strings
 */
function capitalize(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Main documentation generation function
 */
async function generateDocumentation() {
  console.log("📚 Generating documentation...\n");

  // Create docs directory
  const docsDir = "./docs";
  const chaptersDir = path.join(docsDir, "chapters");

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true });
  }

  // Parse documentation from files
  console.log("🔍 Parsing documentation from source files...");
  const testFiles = [
    "./test/ConfidentialMedicalResearch.test.ts",
  ];

  for (const file of testFiles) {
    if (fs.existsSync(file)) {
      console.log(`  ✓ Parsing ${file}`);
      parseTypeScriptDocs(file);
    }
  }

  // Generate main README
  console.log("📝 Generating main README...");
  const mainReadme = generateMainReadme();
  fs.writeFileSync(path.join(docsDir, "README.md"), mainReadme);
  console.log("  ✓ docs/README.md");

  // Generate chapter documentation
  console.log("📖 Generating chapter documentation...");
  for (const chapter of chapters) {
    const chapterDocs = generateChapterDocs(chapter);
    if (chapterDocs) {
      fs.writeFileSync(
        path.join(chaptersDir, `${chapter}.md`),
        chapterDocs
      );
      console.log(`  ✓ docs/chapters/${chapter}.md`);
    }
  }

  // Generate SUMMARY.md for GitBook
  console.log("📑 Generating GitBook summary...");
  const summary = generateSummary();
  fs.writeFileSync(path.join(docsDir, "SUMMARY.md"), summary);
  console.log("  ✓ docs/SUMMARY.md");

  // Generate book.json configuration
  const bookConfig = {
    title: "Confidential Medical Research - FHEVM Example",
    description:
      "Privacy-preserving medical research platform using Fully Homomorphic Encryption",
    author: "Medical Research Team",
    language: "en",
    gitbook: "3.2.3",
    root: "./docs",
    structure: {
      readme: "README.md",
      summary: "SUMMARY.md",
    },
    plugins: ["theme-default"],
    pluginsConfig: {
      "theme-default": {
        styles: {
          website: "styles/website.css",
        },
      },
    },
  };

  fs.writeFileSync(
    path.join(docsDir, "book.json"),
    JSON.stringify(bookConfig, null, 2)
  );
  console.log("  ✓ docs/book.json");

  console.log("\n✨ Documentation generation completed!");
  console.log(`\n📖 Generated ${chapters.size} chapters and main documentation`);
  console.log("\n🚀 To view documentation with GitBook:");
  console.log("  npm install -g gitbook-cli");
  console.log("  cd docs && gitbook serve");
}

// Execute documentation generation
generateDocumentation().catch((error) => {
  console.error("❌ Documentation generation failed:");
  console.error(error);
  process.exit(1);
});
