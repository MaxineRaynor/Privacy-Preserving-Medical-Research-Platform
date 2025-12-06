# Contributing to Confidential Medical Research

Thank you for your interest in contributing to this FHEVM example! This document provides guidelines for contributing to the project.

## 🎯 Project Overview

This project is part of the **Zama FHEVM Bounty Track December 2025** and serves as a comprehensive example of building privacy-preserving applications with Fully Homomorphic Encryption.

## 🤝 How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. **Search existing issues** to avoid duplicates
2. **Open a new issue** with a descriptive title
3. **Provide details**:
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)
   - Relevant code snippets or logs

### Submitting Changes

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Write/update tests**
5. **Update documentation**
6. **Run tests**: `npm test`
7. **Run linting**: `npm run lint:fix`
8. **Commit changes**: Use clear, descriptive commit messages
9. **Push to your fork**: `git push origin feature/your-feature-name`
10. **Submit a Pull Request**

### Pull Request Guidelines

- **Title**: Clear and descriptive (e.g., "Add input validation tests" or "Fix access control bug")
- **Description**: Explain what and why, not just how
- **Reference issues**: Use "Fixes #123" or "Relates to #456"
- **Keep focused**: One feature or fix per PR
- **Update CHANGELOG.md**: Add entry for your changes
- **Pass all checks**: Ensure tests and linting pass

## 📝 Code Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code style (enforced by ESLint and Prettier)
- Write clear, self-documenting code
- Add JSDoc/TSDoc comments for functions
- Use meaningful variable and function names

Example:
```typescript
/**
 * ## Validates Patient Age
 *
 * Ensures age is within acceptable medical research range.
 *
 * @param age - Patient age to validate
 * @returns true if valid, throws error otherwise
 *
 * chapter: validation
 */
function validateAge(age: number): boolean {
  if (age < 1 || age > 120) {
    throw new Error("Invalid age range");
  }
  return true;
}
```

### Solidity

- Follow Solidity style guide
- Use natspec comments for all functions
- Keep functions focused and small
- Use meaningful variable names
- Include proper error messages

Example:
```solidity
/**
 * @notice Submits encrypted patient data to a study
 * @dev Data is encrypted using FHE before storage
 * @param _studyId Study to submit data to
 * @param _age Patient age (1-120)
 * @param _symptomScore Symptom severity (0-100)
 */
function submitPatientData(
    uint32 _studyId,
    uint8 _age,
    uint8 _symptomScore
) external onlyVerifiedPatient {
    // Implementation
}
```

### Testing

- Write tests for all new features
- Include both positive and negative test cases
- Add JSDoc comments to test descriptions
- Use descriptive test names that explain what is being tested
- Test edge cases and error conditions

Example:
```typescript
/**
 * ## Anti-Pattern: Invalid Age Submission
 *
 * This test demonstrates proper input validation by attempting
 * to submit data with an invalid age value.
 *
 * chapter: validation
 */
it("Should reject invalid age values", async function () {
  await expect(
    contract.submitPatientData(1, 0, 75, 60)
  ).to.be.revertedWith("Invalid age range");
});
```

## 📚 Documentation Standards

### Code Documentation

- Add JSDoc/TSDoc comments to all exported functions
- Include `@param`, `@returns`, and `@throws` tags
- Add `chapter: <name>` tags for documentation generation
- Explain FHEVM concepts and patterns

### README Updates

- Keep README up to date with new features
- Update examples if API changes
- Add new sections as needed
- Maintain clear, concise language

### Test Documentation

- Use descriptive test suite names
- Add multi-line comments explaining complex test scenarios
- Include chapter tags for documentation generation
- Document anti-patterns and common mistakes

## 🧪 Testing Requirements

All contributions must include:

1. **Unit tests** for new functionality
2. **Integration tests** for workflows
3. **Negative tests** for error conditions
4. **Documentation** in test comments

Run tests before submitting:
```bash
npm run test
npm run test:verbose
npm run coverage
```

## 🎨 Code Style

We use ESLint and Prettier for consistent code formatting:

```bash
# Check formatting
npm run lint
npm run format:check

# Auto-fix issues
npm run lint:fix
npm run format
```

## 🔐 Security Considerations

When contributing:

- Never commit private keys or sensitive data
- Review access control logic carefully
- Test encryption/decryption workflows thoroughly
- Validate all user inputs
- Consider gas optimization for on-chain operations
- Document security assumptions

## 🐛 Common Issues

### Test Failures

If tests fail:
1. Ensure you're using Node.js >= 18
2. Run `npm install` to update dependencies
3. Clear cache: `npm run clean`
4. Recompile: `npm run compile`

### TypeScript Errors

If TypeScript compilation fails:
1. Check `tsconfig.json` is not modified
2. Ensure all imports are correct
3. Run `npm run typechain` to regenerate types

### Linting Errors

If linting fails:
1. Run `npm run lint:fix` for auto-fixes
2. Manually fix remaining issues
3. Check ESLint configuration if rules seem wrong

## 📦 Commit Message Format

Use clear, descriptive commit messages:

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat: Add patient batch submission

Implements batch submission for multiple patients to reduce
gas costs. Includes tests and documentation.

chapter: patient-data
```

```
fix: Correct access control in publishResults

Previously, any address could publish results. Now restricted
to authorized researchers only.

Fixes #42
```

## 🎓 Learning Resources

To better understand FHEVM:

- [Zama Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Whitepaper](https://github.com/zama-ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🌟 Recognition

Contributors will be:
- Listed in CHANGELOG.md
- Mentioned in project documentation
- Credited in bounty submissions

## ❓ Questions

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Open a new issue with the "question" label

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FHEVM education and the Zama ecosystem! 🎉
