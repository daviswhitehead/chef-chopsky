# Test Delegation Instructions: TypingIndicator Component

## 🎯 Agent Task Brief

**Task Name:** TypingIndicator Component Implementation  
**Branch:** `feature/typing-indicator-test`  
**Timebox:** 2-3 hours maximum  

## 📋 Detailed Requirements

### Component Specifications
**File to create:** `frontend/components/TypingIndicator.tsx`

**Props Interface:**
```typescript
interface TypingIndicatorProps {
  isVisible: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Component Requirements:**
- **Animation**: Three dots that animate in sequence (bounce or fade effect)
- **Accessibility**: `aria-label="Typing..."` and `role="status"`
- **Responsive Design**: Scales appropriately across web/desktop/tablet/mobile
- **Styling**: Use NativeWind classes, gluestack components where possible
- **Cross-platform**: Works in both React Native and React Native Web

### Integration Requirements
**Update:** `frontend/components/ChatInterface.tsx`
- Replace the current loading indicator (lines 258-267) with the new TypingIndicator component
- Show TypingIndicator when `isLoading` is true
- Pass appropriate props: `isVisible={isLoading}`

### Testing Requirements
**File to create:** `frontend/tests/e2e/typing-indicator.spec.ts`

**Test Scenarios:**
1. **Visibility Test**: Verify typing indicator appears during message streaming
2. **Responsive Test**: Test across viewport sizes (320px, 768px, 1024px, 1440px)
3. **Accessibility Test**: Verify ARIA labels and roles are present
4. **Animation Test**: Verify animation plays when visible

### Definition of Done Checklist
- [ ] Component created with proper TypeScript types
- [ ] Integrated into ChatInterface (replaces current loading indicator)
- [ ] Playwright test added and passing
- [ ] Responsive design verified across viewports
- [ ] Lint/types clean (`npm run lint` passes)
- [ ] CI tests pass
- [ ] Screenshots/gif showing animation and responsive behavior

### Artifacts Required in PR
- Screenshots or short gif showing the animation
- Before/after screenshots of ChatInterface integration
- Test results showing responsive behavior
- Clear PR description with implementation details

## 🚀 Agent Execution Instructions

### Step 1: Analyze Existing Code
1. Review `frontend/components/ChatInterface.tsx` (lines 258-267) to understand current loading state
2. Check existing component patterns in `frontend/components/`
3. Review styling patterns using NativeWind classes
4. Check Playwright test patterns in `frontend/tests/e2e/`

### Step 2: Implement Component
1. Create `frontend/components/TypingIndicator.tsx` with the specified interface
2. Implement smooth animation for three dots
3. Ensure accessibility attributes are present
4. Test responsive behavior across different screen sizes

### Step 3: Integration
1. Update `frontend/components/ChatInterface.tsx` to use TypingIndicator
2. Replace the current loading indicator (lines 258-267)
3. Ensure proper prop passing and state management

### Step 4: Testing
1. Create `frontend/tests/e2e/typing-indicator.spec.ts`
2. Implement all test scenarios listed above
3. Ensure tests pass locally in headless mode
4. Verify tests work across different viewport sizes

### Step 5: Validation
1. Run `npm run lint` to ensure code quality
2. Run Playwright tests to verify functionality
3. Test responsive behavior manually
4. Create screenshots/gifs for PR artifacts

## 📊 Success Criteria

**Technical Requirements:**
- Component works on web, desktop, tablet, and mobile
- Animation is smooth and visually appealing
- Accessibility standards met (WCAG compliance)
- Tests pass locally and in CI
- No linting or TypeScript errors

**User Experience:**
- Clear visual indication that AI is processing
- Consistent with existing design patterns
- Responsive across all device sizes
- Accessible to screen readers

**Code Quality:**
- Follows existing code patterns in the repo
- Proper TypeScript typing
- Clean, maintainable code
- Comprehensive test coverage

## 🔍 Review Checklist (for human reviewer)

When the PR is ready, verify:
- [ ] Component follows TypeScript best practices
- [ ] Cross-platform compatibility (web/desktop/tablet/mobile)
- [ ] Tests pass locally and in CI
- [ ] Lint/types clean
- [ ] Accessibility features implemented
- [ ] Responsive design verified
- [ ] PR description is clear with screenshots
- [ ] All artifacts included
- [ ] Integration with ChatInterface is seamless

## 📝 Expected PR Description Template

```markdown
## TypingIndicator Component Implementation

### What Changed
- Created new `TypingIndicator` component with smooth three-dot animation
- Integrated component into `ChatInterface` to replace existing loading indicator
- Added comprehensive E2E tests for visibility, responsiveness, and accessibility

### Technical Details
- **Component**: `frontend/components/TypingIndicator.tsx`
- **Integration**: Updated `frontend/components/ChatInterface.tsx`
- **Tests**: Added `frontend/tests/e2e/typing-indicator.spec.ts`
- **Animation**: CSS-based three-dot bounce sequence
- **Accessibility**: ARIA labels and role attributes

### Testing
- [x] All Playwright tests pass
- [x] Responsive design verified across viewports
- [x] Accessibility compliance checked
- [x] Cross-platform compatibility confirmed

### Screenshots
[Include screenshots/gifs showing animation and responsive behavior]

### Artifacts
- Animation demonstration: [link/gif]
- Responsive behavior: [screenshots]
- Test results: [test output]
```

---

## 🎯 Ready to Delegate

Copy the entire content above and give it to your Cursor Background Agent with this prompt:

```
I need you to implement the TypingIndicator component for Chef Chopsky. Here are the detailed requirements:

[PASTE THE ENTIRE CONTENT ABOVE]

Please work on the feature branch `feature/typing-indicator-test` and ensure all requirements are met. Let me know if you need any clarification on the requirements.
```
