# Developer Guide

Welcome to the FHEVM Example Hub Developer Guide! This document explains how to add new examples, update dependencies, and maintain the example repository ecosystem.

## Table of Contents

- [Overview](#overview)
- [Adding New Examples](#adding-new-examples)
- [Creating Category Projects](#creating-category-projects)
- [Documentation Guidelines](#documentation-guidelines)
- [Testing Standards](#testing-standards)
- [Updating Dependencies](#updating-dependencies)
- [Maintenance Tools](#maintenance-tools)
- [Best Practices](#best-practices)

## Overview

This project demonstrates the Zama FHEVM Bounty Track December 2025 requirements:

✅ **Automation scripts** - TypeScript-based CLI tools for generating example repositories
✅ **Example contracts** - Well-documented Solidity contracts demonstrating FHEVM concepts
✅ **Comprehensive tests** - Test suites showing both correct usage and common pitfalls
✅ **Documentation generator** - Tool to create GitBook-compatible documentation
✅ **Base template** - Hardhat template that can be cloned and customized

## Adding New Examples

### Using the Automation Script

The easiest way to create a new example is using our CLI tool:

```bash
# Generate a new standalone example
npm run create-example <example-name> [output-dir]

# Examples:
npm run create-example medical-research ./my-medical-example
ts-node scripts/create-fhevm-example.ts access-control ./access-example
```

### Manual Example Creation

If you prefer to create examples manually:

#### 1. Create Project Structure

```bash
mkdir my-example
cd my-example

# Create directories
mkdir -p contracts test scripts docs
```

#### 2. Copy Base Template

```bash
# Copy essential configuration files
cp ../base-template/hardhat.config.ts .
cp ../base-template/tsconfig.json .
cp ../base-template/package.json .
cp ../base-template/.env.example .
```

#### 3. Implement Your Contract

Create your Solidity contract in `contracts/`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Your Example Contract
/// @notice Demonstrate specific FHEVM concepts here
contract YourContract is ZamaEthereumConfig {
    // Your implementation
}
```

#### 4. Write Comprehensive Tests

Create test file in `test/`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * # Your Example Tests
 *
 * This test suite demonstrates:
 * - Concept 1
 * - Concept 2
 * - Anti-patterns to avoid
 *
 * chapter: your-chapter
 */
describe("YourContract", function () {
  // Your tests
});
```

#### 5. Add Documentation Annotations

Use JSDoc/TSDoc comments with chapter tags:

```typescript
/**
 * ## Feature Name
 *
 * This test demonstrates:
 * 1. What the feature does
 * 2. Why it's important
 * 3. Real-world use cases
 *
 * chapter: encryption
 * chapter: access-control
 */
it("Should demonstrate the feature", async function () {
  // Test implementation
});
```

#### 6. Generate Documentation

```bash
npm run generate-docs
```

This creates GitBook-compatible documentation in the `docs/` directory.

## Creating Category Projects

Category projects organize multiple related examples:

```bash
# Generate a category project
npm run create-category <category-name> [output-dir]

# Examples:
npm run create-category healthcare ./healthcare-examples
ts-node scripts/create-fhevm-category.ts encryption ./encryption-examples
```

### Available Categories

- **healthcare** - Medical and healthcare privacy examples
- **access-control** - FHE permission management patterns
- **encryption** - FHE encryption and data handling examples

### Adding Examples to Categories

1. Generate the category project:
   ```bash
   npm run create-category healthcare ./my-category
   ```

2. Navigate to the category:
   ```bash
   cd my-category
   ```

3. Create individual examples:
   ```bash
   npm run create-example medical-research examples/medical-research
   ```

## Documentation Guidelines

### JSDoc/TSDoc Annotations

All tests should include comprehensive documentation:

```typescript
/**
 * ## Clear Title
 *
 * **What it demonstrates:**
 * - First concept
 * - Second concept
 *
 * **Why it's important:**
 * Explanation of significance
 *
 * **Real-world use cases:**
 * - Use case 1
 * - Use case 2
 *
 * chapter: chapter-name
 * category: category-name
 */
```

### Chapter Organization

Organize documentation into logical chapters:

- `setup` - Deployment and initialization
- `encryption` - FHE encryption patterns
- `access-control` - Permission management
- `decryption` - User and public decryption
- `anti-patterns` - Common mistakes to avoid

### Documentation Generation

The documentation generator (`generate-docs.ts`) automatically:

1. Parses JSDoc comments from test files
2. Extracts chapter annotations
3. Generates chapter-based markdown files
4. Creates GitBook SUMMARY.md
5. Produces book.json configuration

Run it with:

```bash
npm run generate-docs
```

### Viewing Documentation with GitBook

```bash
# Install GitBook CLI globally
npm install -g gitbook-cli

# Navigate to docs directory
cd docs

# Install GitBook dependencies
gitbook install

# Serve documentation locally
gitbook serve
```

Open http://localhost:4000 to view the documentation.

## Testing Standards

### Test Structure

Organize tests into logical sections:

```typescript
describe("ContractName", function () {
  describe("Feature Group", function () {
    it("Should do positive thing", async function () {
      // Test success case
    });

    it("Should reject invalid input", async function () {
      // Test failure case
    });
  });
});
```

### Test Coverage Requirements

- ✅ **Unit tests** for individual functions
- ✅ **Integration tests** for workflows
- ✅ **Positive tests** showing correct usage
- ✅ **Negative tests** showing anti-patterns
- ✅ **Edge cases** and boundary conditions

### Anti-Pattern Examples

Always include tests demonstrating what NOT to do:

```typescript
/**
 * ## Anti-Pattern: Missing Access Permissions
 *
 * This demonstrates a common mistake: encrypting data
 * without granting proper access permissions.
 *
 * chapter: anti-patterns
 */
it("Should fail without FHE.allowThis()", async function () {
  await expect(
    contract.badFunction()
  ).to.be.reverted;
});
```

## Updating Dependencies

### When to Update

- New FHEVM version released
- Security vulnerabilities discovered
- Bug fixes in dependencies
- Feature requirements change

### Update Process

1. **Update package.json:**
   ```json
   {
     "dependencies": {
       "@fhevm/solidity": "^0.9.1"
     }
   }
   ```

2. **Install updated dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Test all examples:**
   ```bash
   npm run compile
   npm test
   ```

4. **Update contract imports if needed:**
   ```solidity
   import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
   ```

5. **Regenerate TypeChain types:**
   ```bash
   npm run compile
   ```

### Breaking Changes

When updating to a version with breaking changes:

1. Review FHEVM changelog
2. Update contract code
3. Update tests
4. Update documentation
5. Test thoroughly
6. Update CHANGELOG.md

## Maintenance Tools

### Automation Scripts

- **create-fhevm-example.ts** - Generate standalone examples
- **create-fhevm-category.ts** - Generate category projects
- **generate-docs.ts** - Auto-generate documentation

### Quality Tools

- **ESLint** - Code linting
  ```bash
  npm run lint
  npm run lint:fix
  ```

- **Prettier** - Code formatting
  ```bash
  npm run format
  npm run format:check
  ```

- **Hardhat** - Contract compilation and testing
  ```bash
  npm run compile
  npm test
  npm run coverage
  ```

### Dependency Management

Check for outdated dependencies:

```bash
npm outdated
```

Update specific package:

```bash
npm update @fhevm/solidity --legacy-peer-deps
```

## Best Practices

### Contract Development

1. **Always use latest FHEVM version** for new examples
2. **Import from correct config** (`ZamaEthereumConfig` not `SepoliaConfig`)
3. **Include comprehensive natspec comments**
4. **Use appropriate encrypted types** (euint8, euint16, euint32, etc.)
5. **Grant proper access permissions** (FHE.allowThis, FHE.allow)

### Testing

1. **Test both success and failure cases**
2. **Include anti-pattern demonstrations**
3. **Add JSDoc comments to all tests**
4. **Use descriptive test names**
5. **Test edge cases and boundaries**

### Documentation

1. **Write clear, concise explanations**
2. **Include code examples**
3. **Add chapter annotations**
4. **Explain WHY, not just WHAT**
5. **Link to relevant FHEVM docs**

### Code Organization

1. **Keep examples focused and simple**
2. **One concept per example**
3. **Separate concerns clearly**
4. **Use consistent naming**
5. **Follow existing structure**

## Common Issues and Solutions

### Compilation Errors

**Issue:** `DeclarationError: Declaration not found`

**Solution:** Check import paths and FHEVM version compatibility

```solidity
// Correct import for FHEVM 0.9.1+
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

### Dependency Conflicts

**Issue:** `npm ERR! peer dependency conflict`

**Solution:** Use legacy peer deps flag

```bash
npm install --legacy-peer-deps
```

### TypeChain Type Errors

**Issue:** TypeScript errors after contract changes

**Solution:** Regenerate types

```bash
npm run clean
npm run compile
```

### Test Failures

**Issue:** Tests fail on FHEVM operations

**Solution:** Ensure proper network configuration and FHEVM setup in hardhat.config.ts

## Contributing

When contributing new examples:

1. Follow this developer guide
2. Add comprehensive tests
3. Include documentation annotations
4. Test thoroughly
5. Submit PR with clear description

## Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM GitHub Repository](https://github.com/zama-ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [GitBook Documentation](https://docs.gitbook.com/)

## Support

For questions or issues:

- Check [CONTRIBUTING.md](CONTRIBUTING.md)
- Review existing examples
- Consult FHEVM documentation
- Ask in Zama Discord community

---

**Happy building with FHEVM! 🔐**

*This guide is part of the Zama FHEVM Example Hub - December 2025 Bounty Track*
