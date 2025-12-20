#!/usr/bin/env ts-node

/**
 * create-fhevm-category - CLI tool to generate category-based FHEVM example projects
 *
 * Usage: ts-node scripts/create-fhevm-category.ts <category-name> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-category.ts healthcare ./healthcare-examples
 *
 * This script creates a category project containing multiple related examples:
 * - Organizes examples by topic/category
 * - Generates unified documentation
 * - Creates category-specific README
 * - Maintains consistent structure
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Color codes for terminal output
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
  Magenta = '\x1b[35m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

function header(message: string): void {
  log(`\n${'='.repeat(70)}`, Color.Cyan);
  log(`  ${message}`, Color.Cyan);
  log(`${'='.repeat(70)}\n`, Color.Cyan);
}

// Example item in a category
interface ExampleItem {
  name: string;
  description: string;
  contract: string;
  concepts: string[];
}

// Category configuration
interface CategoryConfig {
  name: string;
  description: string;
  examples: ExampleItem[];
  learningPath: string[];
}

// Available categories
const CATEGORIES: Record<string, CategoryConfig> = {
  healthcare: {
    name: 'Healthcare & Medical Research',
    description: 'Privacy-preserving healthcare and medical research examples',
    examples: [
      {
        name: 'medical-research',
        description: 'Complete medical research platform with encrypted patient data',
        contract: 'ConfidentialMedicalResearch',
        concepts: ['encryption', 'access-control', 'data-collection'],
      },
      {
        name: 'patient-records',
        description: 'Confidential patient record management system',
        contract: 'ConfidentialPatientRecords',
        concepts: ['encryption', 'privacy', 'access-control'],
      },
      {
        name: 'clinical-trials',
        description: 'Privacy-preserving clinical trial data collection',
        contract: 'ConfidentialClinicalTrials',
        concepts: ['encryption', 'anonymity', 'data-integrity'],
      },
    ],
    learningPath: [
      'Start with medical-research to understand basic encrypted data collection',
      'Explore patient-records for record management patterns',
      'Study clinical-trials for advanced anonymization techniques',
    ],
  },
  'access-control': {
    name: 'Access Control Patterns',
    description: 'Comprehensive examples of FHE access control mechanisms',
    examples: [
      {
        name: 'basic-permissions',
        description: 'FHE.allow() and FHE.allowThis() fundamentals',
        contract: 'BasicPermissions',
        concepts: ['FHE.allow', 'FHE.allowThis', 'permissions'],
      },
      {
        name: 'role-based-access',
        description: 'Role-based access control with FHE',
        contract: 'RoleBasedAccess',
        concepts: ['roles', 'permissions', 'access-control'],
      },
      {
        name: 'dynamic-permissions',
        description: 'Dynamic permission management for encrypted data',
        contract: 'DynamicPermissions',
        concepts: ['permissions', 'dynamic', 'access-control'],
      },
    ],
    learningPath: [
      'Begin with basic-permissions to learn FHE permission fundamentals',
      'Progress to role-based-access for practical patterns',
      'Master dynamic-permissions for advanced use cases',
    ],
  },
  encryption: {
    name: 'Encryption Patterns',
    description: 'Examples demonstrating FHE encryption and data handling',
    examples: [
      {
        name: 'basic-encryption',
        description: 'FHE encryption with euint8 and euint32',
        contract: 'BasicEncryption',
        concepts: ['FHE.asEuint8', 'FHE.asEuint32', 'encryption'],
      },
      {
        name: 'multi-value-encryption',
        description: 'Handling multiple encrypted values efficiently',
        contract: 'MultiValueEncryption',
        concepts: ['encryption', 'batching', 'optimization'],
      },
      {
        name: 'encrypted-storage',
        description: 'Best practices for storing encrypted data',
        contract: 'EncryptedStorage',
        concepts: ['storage', 'encryption', 'handles'],
      },
    ],
    learningPath: [
      'Start with basic-encryption to understand FHE data types',
      'Learn multi-value-encryption for efficient data handling',
      'Study encrypted-storage for production patterns',
    ],
  },
};

function showHelp(): void {
  header('FHEVM Category Generator');

  info('Usage:');
  console.log('  ts-node scripts/create-fhevm-category.ts <category-name> [output-dir]\n');

  info('Available Categories:');
  Object.entries(CATEGORIES).forEach(([key, config]) => {
    console.log(`  ${Color.Green}${key}${Color.Reset} - ${config.name}`);
    console.log(`    ${config.description}`);
    console.log(`    Examples: ${config.examples.length}`);
    console.log(`    ${Color.Cyan}${config.examples.map(e => e.name).join(', ')}${Color.Reset}\n`);
  });

  info('Examples:');
  console.log('  ts-node scripts/create-fhevm-category.ts healthcare ./my-healthcare-examples');
  console.log('  npm run create-category encryption');
  console.log('  ts-node scripts/create-fhevm-category.ts --help\n');
}

function generateCategoryReadme(outputDir: string, config: CategoryConfig): void {
  info('Generating category README...');

  const readmeContent = `# ${config.name}

${config.description}

## Overview

This category project contains ${config.examples.length} comprehensive examples demonstrating privacy-preserving patterns in the **${config.name.toLowerCase()}** domain using FHEVM (Fully Homomorphic Encryption Virtual Machine).

## Examples Included

${config.examples
  .map(
    (example, idx) => `### ${idx + 1}. ${example.name}

${example.description}

**Key Concepts:** ${example.concepts.map(c => `\`${c}\``).join(', ')}

**Contract:** \`${example.contract}.sol\`

**Location:** \`examples/${example.name}/\`
`
  )
  .join('\n')}

## Learning Path

We recommend following this progression:

${config.learningPath.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

## Project Structure

\`\`\`
${config.name.toLowerCase().replace(/\s+/g, '-')}/
├── examples/
${config.examples.map(e => `│   ├── ${e.name}/`).join('\n')}
│   │   ├── contracts/
│   │   ├── test/
│   │   └── README.md
├── docs/
│   ├── README.md
│   └── chapters/
├── scripts/
│   ├── create-fhevm-example.ts
│   └── generate-docs.ts
├── package.json
└── README.md (this file)
\`\`\`

## Quick Start

### Installation

\`\`\`bash
npm install
\`\`\`

### Working with Examples

Each example is a self-contained project:

\`\`\`bash
# Navigate to an example
cd examples/medical-research

# Compile contracts
npm run compile

# Run tests
npm test

# Generate documentation
npm run generate-docs
\`\`\`

### Running All Tests

From the root directory:

\`\`\`bash
npm run test:all
\`\`\`

### Generating Unified Documentation

\`\`\`bash
npm run generate-docs
\`\`\`

This creates comprehensive GitBook-compatible documentation for all examples in the category.

## Key FHEVM Concepts

This category demonstrates:

${Array.from(new Set(config.examples.flatMap(e => e.concepts)))
  .map(concept => `- **${concept}**: Implemented across multiple examples with varying complexity`)
  .join('\n')}

## Development

### Adding a New Example

1. Create a new example using the generator:
   \`\`\`bash
   npm run create-example <example-name>
   \`\`\`

2. Implement your contract and tests

3. Add documentation annotations

4. Run tests and generate docs:
   \`\`\`bash
   npm test
   npm run generate-docs
   \`\`\`

### Best Practices

- Follow existing code style and structure
- Add comprehensive JSDoc/TSDoc comments
- Include both positive and negative test cases
- Document FHEVM concepts and patterns
- Add anti-pattern examples where relevant

## Resources

- [Zama Official Website](https://www.zama.ai)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM GitHub Repository](https://github.com/zama-ai/fhevm)
- [Zama Discord Community](https://discord.gg/zama)
- [Bounty Program](https://github.com/zama-ai/bounty-program)

## Contributing

This category is part of the Zama FHEVM Example Hub. Contributions are welcome!

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

---

**Part of the Zama FHEVM Example Hub - December 2025 Bounty Track**

**Category:** ${config.name} | **Examples:** ${config.examples.length} | **Maintained by:** Community
`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);
  success('Generated category README.md');
}

function generateCategoryPackageJson(outputDir: string, config: CategoryConfig): void {
  info('Generating package.json...');

  const allConcepts = Array.from(new Set(config.examples.flatMap(e => e.concepts)));

  const packageJson = {
    name: `fhevm-${config.name.toLowerCase().replace(/\s+/g, '-')}-examples`,
    version: '1.0.0',
    description: config.description,
    main: 'index.js',
    scripts: {
      compile: 'hardhat compile',
      'test:all': 'hardhat test examples/**/test/*.ts',
      'generate-docs': 'ts-node scripts/generate-docs.ts',
      'create-example': 'ts-node scripts/create-fhevm-example.ts',
      'create-category': 'ts-node scripts/create-fhevm-category.ts',
      lint: "eslint '**/*.{js,ts}'",
      'lint:fix': "eslint '**/*.{js,ts}' --fix",
      format: "prettier --write '**/*.{json,sol,md,ts,js}'",
      'format:check': "prettier --check '**/*.{json,sol,md,ts,js}'",
    },
    keywords: [
      'fhevm',
      'zama',
      'encryption',
      'blockchain',
      'privacy',
      config.name.toLowerCase().replace(/\s+/g, '-'),
      ...allConcepts,
    ],
    author: 'FHEVM Community',
    license: 'MIT',
    devDependencies: {
      '@fhevm/hardhat-plugin': '^0.3.0-1',
      '@nomicfoundation/hardhat-chai-matchers': '^2.1.0',
      '@nomicfoundation/hardhat-ethers': '^3.1.0',
      '@nomicfoundation/hardhat-ignition': '^0.15.16',
      '@nomicfoundation/hardhat-ignition-ethers': '^0.15.17',
      '@nomicfoundation/hardhat-network-helpers': '^1.1.0',
      '@nomicfoundation/hardhat-toolbox': '^5.0.0',
      '@nomicfoundation/hardhat-verify': '^2.1.0',
      '@nomicfoundation/ignition-core': '^0.15.15',
      '@typechain/ethers-v6': '^0.5.1',
      '@typechain/hardhat': '^9.1.0',
      '@types/chai': '^4.3.20',
      '@types/mocha': '^10.0.10',
      '@types/node': '^20.19.8',
      '@typescript-eslint/eslint-plugin': '^8.37.0',
      '@typescript-eslint/parser': '^8.37.0',
      chai: '^4.5.0',
      'chai-as-promised': '^8.0.1',
      'cross-env': '^7.0.3',
      eslint: '^8.57.1',
      'eslint-config-prettier': '^9.1.0',
      ethers: '^6.15.0',
      hardhat: '^2.26.0',
      'hardhat-gas-reporter': '^2.3.0',
      mocha: '^11.7.1',
      prettier: '^3.6.2',
      'prettier-plugin-solidity': '^2.1.0',
      'solidity-coverage': '^0.8.16',
      'ts-node': '^10.9.2',
      typechain: '^8.3.2',
      typescript: '^5.8.3',
    },
    dependencies: {
      '@fhevm/solidity': '^0.9.1',
      'encrypted-types': '^0.0.4',
      dotenv: '^16.0.0',
    },
  };

  fs.writeFileSync(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  success('Generated package.json');
}

function createExampleStructure(outputDir: string, example: ExampleItem): void {
  info(`Creating example: ${example.name}`);

  const exampleDir = path.join(outputDir, 'examples', example.name);
  fs.mkdirSync(exampleDir, { recursive: true });

  // Create subdirectories
  ['contracts', 'test', 'scripts'].forEach(dir => {
    fs.mkdirSync(path.join(exampleDir, dir), { recursive: true });
  });

  // Create placeholder README
  const exampleReadme = `# ${example.name}

${example.description}

## Concepts

${example.concepts.map(c => `- ${c}`).join('\n')}

## Quick Start

\`\`\`bash
npm install
npm run compile
npm test
\`\`\`

See the main category README for more information.
`;

  fs.writeFileSync(path.join(exampleDir, 'README.md'), exampleReadme);
  success(`Created ${example.name}`);
}

function copyScripts(outputDir: string): void {
  info('Copying automation scripts...');

  const currentDir = process.cwd();
  const scriptsDir = path.join(outputDir, 'scripts');

  const scriptsToCopy = ['create-fhevm-example.ts', 'create-fhevm-category.ts', 'generate-docs.ts'];

  scriptsToCopy.forEach(script => {
    const sourcePath = path.join(currentDir, 'scripts', script);
    const destPath = path.join(scriptsDir, script);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      success(`Copied ${script}`);
    }
  });
}

function createDocsStructure(outputDir: string, config: CategoryConfig): void {
  info('Creating documentation structure...');

  const docsDir = path.join(outputDir, 'docs');
  const chaptersDir = path.join(docsDir, 'chapters');

  fs.mkdirSync(chaptersDir, { recursive: true });

  // Create main docs README
  const docsReadme = `# ${config.name} - Documentation

This documentation covers all examples in the ${config.name} category.

## Examples

${config.examples.map((e, idx) => `${idx + 1}. [${e.name}](../examples/${e.name}/README.md)`).join('\n')}

## Chapters

Documentation is organized by concept:

${Array.from(new Set(config.examples.flatMap(e => e.concepts)))
  .map(concept => `- [${concept}](chapters/${concept}.md)`)
  .join('\n')}
`;

  fs.writeFileSync(path.join(docsDir, 'README.md'), docsReadme);
  success('Created docs structure');
}

function main(): void {
  const args = process.argv.slice(2);

  // Show help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Parse arguments
  const categoryName = args[0];
  const outputDir = args[1] || `./${categoryName}-examples`;

  // Validate category name
  if (!CATEGORIES[categoryName]) {
    error(`Unknown category: ${categoryName}\n\nRun with --help to see available categories`);
  }

  const config = CATEGORIES[categoryName];

  // Check if output directory exists
  if (fs.existsSync(outputDir)) {
    error(`Output directory already exists: ${outputDir}`);
  }

  header(`Creating FHEVM Category: ${config.name}`);

  console.log(`📦 Category: ${Color.Green}${categoryName}${Color.Reset}`);
  console.log(`📁 Output: ${Color.Blue}${outputDir}${Color.Reset}`);
  console.log(`📝 Description: ${config.description}`);
  console.log(`🎯 Examples: ${Color.Cyan}${config.examples.length}${Color.Reset}\n`);

  // Create main directory
  fs.mkdirSync(outputDir, { recursive: true });
  success(`Created directory: ${outputDir}`);

  // Generate category README
  generateCategoryReadme(outputDir, config);

  // Generate package.json
  generateCategoryPackageJson(outputDir, config);

  // Create example structures
  config.examples.forEach(example => {
    createExampleStructure(outputDir, example);
  });

  // Copy automation scripts
  copyScripts(outputDir);

  // Create documentation structure
  createDocsStructure(outputDir, config);

  // Copy configuration files
  const configFiles = ['hardhat.config.ts', 'tsconfig.json', '.env.example', '.eslintrc.json', '.prettierrc', '.gitignore'];
  const currentDir = process.cwd();

  configFiles.forEach(file => {
    const sourcePath = path.join(currentDir, file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, path.join(outputDir, file));
    }
  });

  header('Category Project Created Successfully! 🎉');

  console.log('Next steps:\n');
  console.log(`  ${Color.Cyan}cd ${outputDir}${Color.Reset}`);
  console.log(`  ${Color.Cyan}npm install --legacy-peer-deps${Color.Reset}`);
  console.log(`  ${Color.Cyan}npm run compile${Color.Reset}`);
  console.log(`  ${Color.Cyan}npm run test:all${Color.Reset}\n`);

  console.log('To work with individual examples:\n');
  console.log(`  ${Color.Cyan}cd examples/${config.examples[0].name}${Color.Reset}`);
  console.log(`  ${Color.Cyan}npm test${Color.Reset}\n`);

  success(`Category created with ${config.examples.length} examples! 🔐`);
}

// Run the script
if (require.main === module) {
  main();
}
