# Batch 1: Detailed Agent Briefs (Ready to Delegate)

## Task 1: TypingIndicator Component

### Agent Instructions
Create a cross-platform `TypingIndicator` component using gluestack UI + NativeWind that works in both React Native and React Native Web.

### Detailed Requirements
**File to create:** `frontend/components/TypingIndicator.tsx`

**Component specs:**
- Props: `{ isVisible: boolean, size?: 'sm' | 'md' | 'lg' }`
- Animation: Three dots that animate in sequence (bounce or fade)
- Accessibility: `aria-label="Typing..."` and `role="status"`
- Responsive: Scales appropriately across web/desktop/tablet/mobile
- Styling: Use NativeWind classes, gluestack components where possible

**Integration:**
- Update `frontend/components/ChatInterface.tsx` to use this component
- Show when `isStreaming` is true

**Testing:**
- Add Playwright test in `frontend/tests/e2e/` to verify typing indicator appears during message streaming
- Test responsive behavior across viewport sizes (320px, 768px, 1024px, 1440px)

**Definition of Done:**
- [ ] Component created with proper TypeScript types
- [ ] Integrated into ChatInterface
- [ ] Playwright test added and passing
- [ ] Responsive design verified across viewports
- [ ] Lint/types clean (`npm run lint` passes)
- [ ] CI tests pass
- [ ] Screenshots/gif showing animation and responsive behavior

**Artifacts to include in PR:**
- Screenshots or short gif showing the animation
- Before/after screenshots of ChatInterface integration
- Test results showing responsive behavior

---

## Task 2: MessageBubble Component

### Agent Instructions
Create a reusable `MessageBubble` component for chat messages with user/assistant variants, error states, and copy functionality.

### Detailed Requirements
**File to create:** `frontend/components/MessageBubble.tsx`

**Component specs:**
- Props: `{ role: 'user' | 'assistant', content: string, isError?: boolean, isStreaming?: boolean, onCopy?: () => void }`
- Variants: Different styling for user vs assistant messages
- Error state: Red border/background when `isError` is true
- Copy button: Only for assistant messages, calls `onCopy` callback
- Responsive: Text size, padding, button placement adapt across devices
- Accessibility: Proper labels, keyboard navigation

**Styling:**
- User messages: Right-aligned, blue background
- Assistant messages: Left-aligned, gray background
- Error state: Red border, error icon
- Copy button: Small, accessible, only on assistant messages

**Integration:**
- Update `frontend/components/ChatInterface.tsx` to use MessageBubble instead of current message rendering
- Ensure copy-to-clipboard works on web (use `navigator.clipboard.writeText`)

**Testing:**
- Playwright tests for all variants (user, assistant, error, streaming)
- Test copy functionality on web
- Test responsive behavior across viewport sizes
- Test keyboard navigation

**Definition of Done:**
- [ ] Component created with proper TypeScript types
- [ ] All variants implemented (user, assistant, error, streaming)
- [ ] Copy functionality working on web
- [ ] Integrated into ChatInterface
- [ ] Playwright tests added and passing
- [ ] Responsive design verified
- [ ] Accessibility features implemented
- [ ] Lint/types clean
- [ ] CI tests pass

**Artifacts to include in PR:**
- Screenshots showing all variants
- Before/after screenshots of ChatInterface
- Test results showing responsive behavior
- Demo of copy functionality

---

## Task 3: E2E Core Chat Flows

### Agent Instructions
Stabilize and extend E2E tests for core chat functionality: starting conversations, sending messages, and submitting feedback.

### Detailed Requirements
**File to create/update:** `frontend/tests/e2e/chat.core.spec.ts`

**Test scenarios:**
1. **Start new conversation**
   - Navigate to home page
   - Click "Start New Conversation" or similar
   - Verify conversation page loads
   - Verify empty state is shown

2. **Send a message**
   - Type in message input
   - Click send button or press Enter
   - Verify message appears in chat
   - Verify typing indicator shows (if streaming)
   - Verify response appears

3. **Submit feedback**
   - After receiving a response
   - Click feedback button (thumbs up/down)
   - Verify feedback is submitted
   - Verify UI updates appropriately

**Technical requirements:**
- Use role-based selectors (`data-testid` attributes)
- Headless mode, fast execution
- Minimal test data setup/teardown
- Resilient to minor UI changes
- Test across different viewport sizes

**Setup/Teardown:**
- Use existing `frontend/tests/e2e/fixtures/setup.ts`
- Ensure tests are idempotent
- Clean up any test data created

**Integration:**
- Ensure tests run in CI
- Update CI workflow if needed (but minimize changes)
- Tests should be stable (no flaky failures)

**Definition of Done:**
- [ ] Test file created with all three scenarios
- [ ] Tests pass locally in headless mode
- [ ] Tests pass in CI
- [ ] Role-based selectors used throughout
- [ ] Responsive testing across viewports
- [ ] No flaky failures
- [ ] Test data cleanup working
- [ ] CI integration verified

**Artifacts to include in PR:**
- Test execution results
- Screenshots of test runs
- Documentation of any CI changes made

---

## Delegation Workflow

### Step 1: Create Feature Branches
For each task, create a feature branch:
```bash
git checkout -b feature/typing-indicator
git checkout -b feature/message-bubble  
git checkout -b feature/e2e-chat-flows
```

### Step 2: Agent Instructions
Copy the relevant brief above and give it to your agent with this context:

**Context for Agent:**
- This is a React Native + React Native Web project using Next.js
- Styling: NativeWind (Tailwind) + gluestack UI
- Database: Supabase
- Testing: Playwright E2E
- All code must be TypeScript
- Components must work on web, desktop, tablet, and mobile
- Follow existing code patterns in the repo

**Agent Prompt Template:**
```
I need you to implement [TASK NAME] for Chef Chopsky. Here are the detailed requirements:

[COPY THE RELEVANT BRIEF ABOVE]

Please:
1. Create the component/test file as specified
2. Follow the existing code patterns in the repo
3. Ensure all tests pass
4. Create a PR with a clear description and screenshots
5. Include the artifacts specified in the brief

Let me know if you need clarification on any requirements.
```

### Step 3: Review Process
When PRs are ready:

**Review Checklist:**
- [ ] Code follows TypeScript best practices
- [ ] Component works on web, desktop, tablet, mobile
- [ ] Tests pass locally and in CI
- [ ] Lint/types clean
- [ ] Accessibility features implemented
- [ ] Responsive design verified
- [ ] PR description is clear with screenshots
- [ ] All artifacts included

**Review Time Target:** 15-20 minutes per PR

### Step 4: Merge or Iterate
- **Merge** if all criteria met
- **Request one revision** if minor issues
- **Archive** if major problems (start over with clearer brief)

### Step 5: Measure and Adjust
Track:
- Time to complete each task
- Review time per PR
- Number of revisions needed
- Test stability

Use this data to refine future briefs and batch sizes.
