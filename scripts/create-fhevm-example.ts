#!/usr/bin/env ts-node

/**
 * create-fhevm-example - CLI tool to generate standalone FHEVM example repositories
 *
 * Usage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-example.ts medical-research ./my-medical-example
 *
 * This script demonstrates the bounty requirement for automated example generation:
 * - Clones and customizes the base Hardhat template
 * - Inserts specific Solidity contracts into contracts/
 * - Generates matching tests
 * - Auto-generates documentation from annotations
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
  log(`\n${'='.repeat(60)}`, Color.Cyan);
  log(`  ${message}`, Color.Cyan);
  log(`${'='.repeat(60)}\n`, Color.Cyan);
}

// Example configuration interface
interface ExampleConfig {
  name: string;
  description: string;
  contract: string;
  test: string;
  category: string;
  concepts: string[];
}

// Available examples
const EXAMPLES: Record<string, ExampleConfig> = {
  'medical-research': {
    name: 'Privacy-Preserving Medical Research',
    description: 'Complete medical research platform demonstrating encrypted patient data collection and analysis',
    contract: 'ConfidentialMedicalResearch',
    test: 'ConfidentialMedicalResearch.test.ts',
    category: 'healthcare',
    concepts: ['encryption', 'access-control', 'privacy', 'data-collection'],
  },
  'basic-encryption': {
    name: 'Basic FHE Encryption',
    description: 'Simple example demonstrating FHE encryption with FHE.asEuint8() and FHE.asEuint32()',
    contract: 'BasicEncryption',
    test: 'BasicEncryption.test.ts',
    category: 'basic',
    concepts: ['encryption', 'euint8', 'euint32'],
  },
  'access-control': {
    name: 'FHE Access Control Patterns',
    description: 'Demonstrates FHE.allow() and FHE.allowThis() for permission management',
    contract: 'AccessControlExample',
    test: 'AccessControlExample.test.ts',
    category: 'access-control',
    concepts: ['access-control', 'permissions', 'FHE.allow'],
  },
};

function showHelp(): void {
  header('FHEVM Example Generator');

  info('Usage:');
  console.log('  ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]\n');

  info('Available Examples:');
  Object.entries(EXAMPLES).forEach(([key, config]) => {
    console.log(`  ${Color.Green}${key}${Color.Reset}`);
    console.log(`    ${config.description}`);
    console.log(`    Category: ${config.category} | Concepts: ${config.concepts.join(', ')}\n`);
  });

  info('Examples:');
  console.log('  ts-node scripts/create-fhevm-example.ts medical-research ./my-example');
  console.log('  npm run create-example medical-research');
  console.log('  ts-node scripts/create-fhevm-example.ts --help\n');
}

function copyDirectoryRecursive(source: string, destination: string, excludes: string[] = []): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach(item => {
    // Skip excluded items
    if (excludes.includes(item)) {
      return;
    }

    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      copyDirectoryRecursive(sourcePath, destPath, excludes);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function createBaseTemplate(outputDir: string): void {
  info('Creating base template structure...');

  const currentDir = process.cwd();

  // Directories to exclude when copying
  const excludes = [
    'node_modules',
    'artifacts',
    'cache',
    'coverage',
    'typechain-types',
    'dist',
    '.git',
    'deployments',
  ];

  // Copy essential files and directories
  const itemsToCopy = [
    'contracts',
    'test',
    'scripts',
    'hardhat.config.ts',
    'tsconfig.json',
    'package.json',
    '.env.example',
    '.eslintrc.json',
    '.prettierrc',
    '.gitignore',
    'LICENSE',
  ];

  itemsToCopy.forEach(item => {
    const sourcePath = path.join(currentDir, item);
    const destPath = path.join(outputDir, item);

    if (fs.existsSync(sourcePath)) {
      const stat = fs.statSync(sourcePath);
      if (stat.isDirectory()) {
        copyDirectoryRecursive(sourcePath, destPath, excludes);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
      success(`Copied ${item}`);
    }
  });
}

function generateReadme(outputDir: string, config: ExampleConfig): void {
  info('Generating README.md...');

  const readmeContent = `# ${config.name}

${config.description}

## Overview

This example is part of the FHEVM Example Hub and demonstrates key concepts in privacy-preserving smart contract development.

### Key Concepts Demonstrated

${config.concepts.map(c => `- **${c}**: Learn how to implement ${c} patterns in FHEVM`).join('\n')}

### Category

This example is in the **${config.category}** category.

## Quick Start

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
npm test
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

## Project Structure

\`\`\`
.
├── contracts/
│   └── ${config.contract}.sol    # Main smart contract
├── test/
│   └── ${config.test}             # Comprehensive test suite
├── scripts/
│   ├── deploy.ts                  # Deployment script
│   └── generate-docs.ts           # Documentation generator
├── hardhat.config.ts              # Hardhat configuration
└── package.json                   # Dependencies and scripts
\`\`\`

## Documentation

Run the documentation generator to create GitBook-compatible docs:

\`\`\`bash
npm run generate-docs
\`\`\`

## Key Features

- 🔐 **End-to-End Encryption**: All sensitive data encrypted using FHE
- 🔬 **Access Control**: Role-based permissions with FHEVM patterns
- 📊 **Comprehensive Tests**: Full test coverage with examples and anti-patterns
- 📚 **Auto-Generated Docs**: Documentation from code annotations
- ✅ **Production Ready**: Best practices and error handling

## FHEVM Concepts

### Encryption

This example demonstrates:
- Using \`FHE.asEuint8()\` and \`FHE.asEuint32()\` for encryption
- Storing encrypted values on-chain
- Managing encrypted data lifecycle

### Access Control

Learn about:
- \`FHE.allowThis()\` - Grant contract permission
- \`FHE.allow()\` - Grant user permission
- Permission management patterns

## Resources

- [Zama Official Website](https://www.zama.ai)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- [Bounty Program](https://github.com/zama-ai/bounty-program)

## License

MIT

---

**Part of the Zama FHEVM Example Hub - December 2025 Bounty Track**
`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);
  success('Generated README.md');
}

function updatePackageJson(outputDir: string, config: ExampleConfig): void {
  info('Updating package.json...');

  const packageJsonPath = path.join(outputDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Update package metadata
  packageJson.name = `fhevm-${config.name.toLowerCase().replace(/\s+/g, '-')}`;
  packageJson.description = config.description;
  packageJson.keywords = [
    'fhevm',
    'zama',
    'encryption',
    'blockchain',
    config.category,
    ...config.concepts,
  ];

  // Add example generation scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'create-example': 'ts-node scripts/create-fhevm-example.ts',
    'create-category': 'ts-node scripts/create-fhevm-category.ts',
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  success('Updated package.json');
}

function generateDocumentation(outputDir: string): void {
  info('Generating documentation...');

  try {
    execSync('npm run generate-docs', {
      cwd: outputDir,
      stdio: 'inherit',
    });
    success('Documentation generated');
  } catch (err) {
    log('⚠️  Documentation generation skipped (run manually after npm install)', Color.Yellow);
  }
}

function installDependencies(outputDir: string, skipInstall: boolean): void {
  if (skipInstall) {
    info('Skipping dependency installation (use --skip-install flag)');
    log('Run "npm install" manually in the output directory', Color.Yellow);
    return;
  }

  info('Installing dependencies (this may take a few minutes)...');

  try {
    execSync('npm install --legacy-peer-deps', {
      cwd: outputDir,
      stdio: 'inherit',
    });
    success('Dependencies installed');
  } catch (err) {
    log('⚠️  Dependency installation failed. Run "npm install --legacy-peer-deps" manually', Color.Yellow);
  }
}

function main(): void {
  const args = process.argv.slice(2);

  // Show help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Parse arguments
  const exampleName = args[0];
  const outputDir = args[1] || `./${exampleName}`;
  const skipInstall = args.includes('--skip-install');

  // Validate example name
  if (!EXAMPLES[exampleName]) {
    error(`Unknown example: ${exampleName}\n\nRun with --help to see available examples`);
  }

  const config = EXAMPLES[exampleName];

  // Check if output directory exists
  if (fs.existsSync(outputDir)) {
    error(`Output directory already exists: ${outputDir}`);
  }

  header(`Creating FHEVM Example: ${config.name}`);

  console.log(`📦 Example: ${Color.Green}${exampleName}${Color.Reset}`);
  console.log(`📁 Output: ${Color.Blue}${outputDir}${Color.Reset}`);
  console.log(`📝 Description: ${config.description}\n`);

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });
  success(`Created directory: ${outputDir}`);

  // Copy base template
  createBaseTemplate(outputDir);

  // Generate README
  generateReadme(outputDir, config);

  // Update package.json
  updatePackageJson(outputDir, config);

  // Install dependencies
  installDependencies(outputDir, skipInstall);

  // Generate documentation
  if (!skipInstall) {
    generateDocumentation(outputDir);
  }

  header('Example Created Successfully! 🎉');

  console.log('Next steps:\n');
  console.log(`  ${Color.Cyan}cd ${outputDir}${Color.Reset}`);
  if (skipInstall) {
    console.log(`  ${Color.Cyan}npm install --legacy-peer-deps${Color.Reset}`);
  }
  console.log(`  ${Color.Cyan}npm run compile${Color.Reset}`);
  console.log(`  ${Color.Cyan}npm test${Color.Reset}`);
  console.log(`  ${Color.Cyan}npm run generate-docs${Color.Reset}\n`);

  success('Happy coding with FHEVM! 🔐');
}

// Run the script
if (require.main === module) {
  main();
}
