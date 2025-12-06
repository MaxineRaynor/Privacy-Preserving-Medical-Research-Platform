# Video Script: Privacy-Preserving Medical Research Platform

**Duration:** 60 seconds (1 minute)
**Format:** Screen recording with narration
**Purpose:** Demonstrate the privacy-preserving medical research platform for Zama Bounty Track December 2025

---

## Scene 1: Introduction (0:00 - 0:10)

**Visual:**
- Title slide with project logo
- Text overlay: "Privacy-Preserving Medical Research Platform"
- Subtitle: "Built with FHEVM - Zama Bounty Track December 2025"

**On-Screen Elements:**
- Project title
- FHEVM logo
- Key feature badges (Encryption, Privacy, Security)

**Action:**
- Fade in title
- Display problem statement overlay
- Transition to solution overview

**Duration:** 10 seconds

---

## Scene 2: Installation & Setup (0:10 - 0:20)

**Visual:**
- Terminal window showing command execution
- Split screen: left side = terminal, right side = file structure

**Commands to Show:**
```bash
git clone <repository-url>
cd confidential-medical-research
npm install
npm run compile
```

**On-Screen Elements:**
- Command prompts highlighted
- Success indicators (green checkmarks)
- File tree showing project structure

**Action:**
1. Clone repository (2 seconds)
2. Install dependencies (3 seconds - show progress bar)
3. Compile contracts (3 seconds - show compilation output)
4. Display project structure (2 seconds)

**Duration:** 10 seconds

---

## Scene 3: Running Tests (0:20 - 0:35)

**Visual:**
- Terminal showing test execution
- Test results with passing indicators
- Coverage report summary

**Commands to Show:**
```bash
npm test
```

**On-Screen Elements:**
- Test suite name: "ConfidentialMedicalResearch"
- Test categories highlighted:
  - ✓ Deployment (2 tests)
  - ✓ Access Control (5 tests)
  - ✓ Medical Study Creation (5 tests)
  - ✓ Patient Data Submission (8 tests)
  - ✓ Study Completion (3 tests)
  - ✓ View Functions (6 tests)
  - ✓ Integration (1 test)
- Total: 30 passing tests
- Coverage: 100%

**Action:**
1. Execute test command (2 seconds)
2. Show test execution with passing indicators (8 seconds)
3. Display coverage summary (3 seconds)
4. Highlight key test categories (2 seconds)

**Duration:** 15 seconds

---

## Scene 4: Contract Deployment (0:35 - 0:45)

**Visual:**
- Terminal showing deployment process
- Contract address displayed
- Network information

**Commands to Show:**
```bash
npm run deploy:local
```

**On-Screen Elements:**
- Deployment progress indicator
- Contract address highlighted
- Gas used display
- Network: localhost (or Sepolia)
- Success message

**Action:**
1. Start local node in background (2 seconds)
2. Deploy contract (5 seconds)
3. Display contract address (2 seconds)
4. Show deployment confirmation (1 second)

**Duration:** 10 seconds

---

## Scene 5: FHEVM Concepts Demonstration (0:45 - 1:00)

**Visual:**
- Code editor showing key contract sections
- Animated diagram illustrating encryption flow
- Real-world application examples

**Code Sections to Highlight:**

1. **Encryption** (3 seconds)
```solidity
euint8 encryptedAge = FHE.asEuint8(_age);
euint8 encryptedSymptomScore = FHE.asEuint8(_symptomScore);
```

2. **Access Control** (3 seconds)
```solidity
FHE.allowThis(encryptedAge);
FHE.allow(encryptedAge, msg.sender);
```

3. **Public Decryption** (3 seconds)
```solidity
FHE.requestDecryption(cts, this.processAggregatedResults.selector);
```

**Animated Diagram:**
- Patient data flows into contract (encrypted)
- Data remains encrypted in storage
- Only aggregated results are decrypted
- Privacy preserved throughout

**On-Screen Elements:**
- Labels for each FHEVM concept
- Flow arrows showing data movement
- Lock icons indicating encryption
- Real-world use cases:
  - Clinical Trials
  - Epidemiological Research
  - Drug Safety Monitoring
  - Public Health Studies

**Action:**
1. Highlight encryption code (3 seconds)
2. Show access control implementation (3 seconds)
3. Demonstrate public decryption (3 seconds)
4. Display real-world applications (3 seconds)
5. Show final summary slide (3 seconds)

**Duration:** 15 seconds

---

## Closing Frame (0:58 - 1:00)

**Visual:**
- Project title with GitHub repository link
- Zama logo
- Contact information

**On-Screen Elements:**
- "Thank you for watching"
- Repository URL placeholder
- "Built for Zama Bounty Track December 2025"
- Social media icons (GitHub, Discord)

**Action:**
- Fade to closing screen
- Display repository information
- End with Zama logo

**Duration:** 2 seconds

---

## Technical Requirements

### Recording Settings
- **Resolution:** 1920x1080 (Full HD)
- **Frame Rate:** 30 fps
- **Format:** MP4 (H.264 codec)
- **Audio:** Clear narration, background music optional (low volume)
- **Bitrate:** 5-10 Mbps

### Screen Recording Setup
- **Terminal:** Use a clean terminal with good contrast
- **Font Size:** Large enough to read clearly (16-18pt)
- **Color Scheme:** Dark theme with syntax highlighting
- **Cursor:** Visible but not distracting
- **Mouse Movements:** Smooth and purposeful

### Editing Guidelines
- Use smooth transitions between scenes (fade, slide)
- Add text overlays for emphasis
- Highlight important code sections
- Keep animations simple and professional
- Ensure all text is readable on smaller screens

### Audio Guidelines
- Clear, professional narration
- No background noise
- Consistent audio levels throughout
- Optional: Subtle background music (non-distracting)
- Use pauses for emphasis

---

## Animation Details

### Text Animations
- **Fade In:** 0.3 seconds
- **Fade Out:** 0.3 seconds
- **Slide In:** 0.5 seconds
- **Highlight:** Pulse effect, 0.5 seconds

### Code Highlighting
- Use syntax highlighting
- Highlight specific lines with color overlay
- Add callout boxes for important sections
- Use arrows to show data flow

### Visual Effects
- **Checkmarks:** Green, animated appearance
- **Progress Bars:** Smooth fill animation
- **Lock Icons:** For encryption indication
- **Flow Arrows:** Animated movement to show data flow

---

## Backup Timing (If Needed)

If video runs slightly over/under 60 seconds, adjust these sections:

**Can be Extended (+5 seconds each):**
- Test execution display (show more test output)
- FHEVM concepts explanation (add more code examples)
- Real-world applications (show more use cases)

**Can be Shortened (-3 seconds each):**
- Installation steps (combine commands)
- Deployment process (show only key output)
- Closing frame (reduce duration to 1 second)

---

## Pre-Production Checklist

- [ ] Clean terminal with proper color scheme
- [ ] All dependencies installed
- [ ] Test execution verified (all passing)
- [ ] Deployment tested on local network
- [ ] Code examples prepared and formatted
- [ ] Screen recording software configured
- [ ] Audio recording equipment tested
- [ ] Narration script practiced
- [ ] Background music selected (if using)
- [ ] Editing software ready

## Post-Production Checklist

- [ ] Video rendered in correct format
- [ ] Audio levels normalized
- [ ] All text overlays readable
- [ ] Transitions smooth
- [ ] Duration within 60 seconds (±2 seconds acceptable)
- [ ] Final quality check on different screen sizes
- [ ] File size reasonable for upload
- [ ] Video uploaded and linked in submission

---

**Notes:**
- Keep narration concise and clear
- Focus on demonstrating functionality, not explaining every detail
- Show the value proposition: privacy + research capability
- Emphasize the FHEVM concepts being demonstrated
- Make it visually appealing and professional
- Ensure compliance with Zama Bounty Track requirements
