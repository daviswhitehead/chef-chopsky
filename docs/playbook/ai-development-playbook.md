# AI Development Playbook
*Tactical guide for solo entrepreneurs building with AI*

## Overview

This playbook integrates the Specflow methodology with proven practices from solo entrepreneurs who successfully leverage AI in their development process. It provides a structured, tactical approach to building software with AI as a collaborative partner.

## Core Principles

1. **Plan First**: Define intent, roadmap, and tasks before execution
2. **Role Clarity**: Assign specific roles to AI and human collaborators
3. **Context Preservation**: Maintain comprehensive documentation for AI context
4. **Iterative Refinement**: Continuous improvement through feedback loops
5. **Quality Gates**: Built-in checkpoints to ensure alignment with goals
6. **Production Safety**: Never compromise production integrity for development convenience

## Production Safety Rules

### 🚨 CRITICAL: Never Use Mock Mode in Production

**The Problem**: Mock modes, test data, and fallback behaviors that work in development can silently fail in production, leading to poor user experience and hidden bugs.

**The Solution**: Implement fail-fast patterns that make configuration errors immediately visible.

#### Rule 1: Environment Validation
- **Always validate critical configuration on startup**
- **Fail loudly and immediately if production requirements are not met**
- **Never fall back to mock/test data in production environments**

```typescript
// ✅ GOOD: Fail loudly in production
if (config.nodeEnv === 'production' && !isValidApiKey) {
  console.error('🚨 CRITICAL ERROR: Cannot run in production with invalid API key!');
  process.exit(1);
}

// ❌ BAD: Silent fallback to mock mode
if (!isValidApiKey) {
  console.warn('Using mock mode');
  return mockResponse;
}
```

#### Rule 2: Configuration Guards
- **Implement environment-specific validation**
- **Use different behaviors for development vs production**
- **Make production failures impossible to ignore**

```typescript
// ✅ GOOD: Environment-aware validation
const isMockMode = !isValidApiKey;
if (isMockMode && config.nodeEnv === 'production') {
  throw new Error('CRITICAL: Mock mode not allowed in production');
}
```

#### Rule 3: Error Visibility
- **Use clear, actionable error messages**
- **Include specific instructions for resolution**
- **Make errors visible in logs, monitoring, and user interfaces**

### Implementation Checklist

#### For AI Services
- [ ] **API Key Validation**: Validate OpenAI/API keys on startup
- [ ] **Environment Guards**: Different behavior for dev vs production
- [ ] **Fail-Fast Pattern**: Exit immediately on critical configuration errors
- [ ] **Clear Error Messages**: Specific, actionable error descriptions
- [ ] **Monitoring Integration**: Ensure errors are visible in logs/monitoring

#### For Frontend Services
- [ ] **Environment Variables**: Validate all required production variables
- [ ] **Service Dependencies**: Verify external service connectivity
- [ ] **Database Configuration**: Ensure production database is properly configured
- [ ] **Error Boundaries**: Graceful error handling with clear user messages

#### For Deployment
- [ ] **Pre-deployment Checks**: Validate configuration before deployment
- [ ] **Health Checks**: Verify all services are properly configured
- [ ] **Monitoring Setup**: Ensure errors are visible and alertable
- [ ] **Rollback Procedures**: Quick rollback if configuration issues are detected

### Common Anti-Patterns to Avoid

#### ❌ Silent Fallbacks
```typescript
// DON'T: Silent fallback to mock data
if (!apiKey) {
  return mockData; // Silent failure in production
}
```

#### ❌ Warning-Only Validation
```typescript
// DON'T: Only warn about configuration issues
if (!apiKey) {
  console.warn('API key missing, using mock data');
  return mockData; // Continues running with wrong data
}
```

#### ❌ Environment-Agnostic Behavior
```typescript
// DON'T: Same behavior in all environments
if (!apiKey) {
  return mockData; // Same fallback in dev and production
}
```

### Success Criteria

- [ ] **No Silent Failures**: All configuration errors are immediately visible
- [ ] **Environment Separation**: Different behaviors for dev vs production
- [ ] **Clear Error Messages**: Users and developers know exactly what's wrong
- [ ] **Monitoring Integration**: Errors are visible in logs and monitoring
- [ ] **Quick Resolution**: Error messages include specific fix instructions

### Testing Production Safety

#### Manual Testing
1. **Deploy with invalid configuration** - Should fail immediately
2. **Check error messages** - Should be clear and actionable
3. **Verify monitoring** - Errors should appear in logs/alerts
4. **Test rollback** - Should be quick and effective

#### Automated Testing
1. **Configuration validation tests** - Verify all required variables
2. **Environment-specific tests** - Different behavior per environment
3. **Error message tests** - Verify error messages are helpful
4. **Integration tests** - End-to-end validation of production setup

---

## The 5-Phase Process

### Phase 1: Intent Capture
**Objective**: Clearly define project vision, problem statement, and success criteria

**Your Role**:
- Articulate the project's vision and goals
- Define the problem statement and target users
- Establish success criteria and constraints
- Identify non-goals and boundaries

**AI's Role**:
- Refine and clarify the intent document
- Identify potential challenges and edge cases
- Suggest improvements to problem definition
- Generate initial user stories and acceptance criteria

**Deliverables**:
- Intent document (using template)
- Problem statement
- Success criteria
- User personas (if applicable)

### Phase 2: Roadmap Creation
**Objective**: Break down project into manageable phases with clear milestones

**Your Role**:
- Outline major phases and dependencies
- Define key milestones and deliverables
- Establish timeline and resource allocation
- Identify critical path items

**AI's Role**:
- Suggest optimal sequencing of phases
- Highlight potential risks and dependencies
- Recommend resource allocation strategies
- Generate detailed phase descriptions

**Deliverables**:
- Project roadmap
- Phase breakdown with milestones
- Risk assessment
- Resource allocation plan

### Phase 3: Task Decomposition
**Objective**: Divide phases into actionable tasks with clear ownership

**Your Role**:
- Define specific tasks and subtasks
- Assign ownership (human vs AI)
- Establish task priorities and dependencies
- Set up quality gates and review processes

**AI's Role**:
- Generate detailed task descriptions
- Suggest task breakdown and sequencing
- Recommend automation opportunities
- Create initial implementation plans

**Deliverables**:
- Task breakdown structure
- Task assignment matrix
- Implementation timeline
- Quality gate definitions

### Phase 4: Collaborative Execution
**Objective**: Implement tasks systematically with AI-human collaboration

**Your Role**:
- Oversee progress and provide strategic direction
- Handle tasks requiring human judgment and creativity
- Review AI outputs and provide feedback
- Make architectural and design decisions

**AI's Role**:
- Execute assigned development tasks
- Generate code, documentation, and tests
- Perform initial quality checks
- Suggest optimizations and improvements

**Deliverables**:
- Working software components
- Documentation and code comments
- Test suites and quality reports
- Progress tracking and status updates

### Phase 5: Continuous Refinement
**Objective**: Iterate and improve based on feedback and testing

**Your Role**:
- Evaluate outputs against success criteria
- Gather user feedback and prioritize improvements
- Make strategic decisions about feature changes
- Plan next iteration cycles

**AI's Role**:
- Implement feedback and suggested changes
- Optimize performance and code quality
- Update documentation and tests
- Suggest additional improvements

**Deliverables**:
- Refined product features
- Updated documentation
- Performance optimizations
- Next iteration planning

## Quality Gates

Each phase includes specific quality gates to ensure progress and alignment:

1. **Intent Gate**: Clear problem definition and success criteria
2. **Roadmap Gate**: Feasible plan with identified risks
3. **Task Gate**: Actionable tasks with clear ownership
4. **Execution Gate**: Working software meeting acceptance criteria
5. **Refinement Gate**: Product ready for next iteration or release

## Success Metrics

- **Velocity**: Tasks completed per phase
- **Quality**: Code quality, test coverage, and user satisfaction
- **Alignment**: Adherence to original intent and success criteria
- **Efficiency**: Time and resource utilization
- **Innovation**: Novel solutions and optimizations discovered

## Tactical Implementation

This playbook now includes **tactical phase-specific Cursor rules** that make each phase super actionable:

### Phase-Specific Cursor Rules
- **101-intent-capture-phase.mdc**: AI role and instructions for Intent Capture
- **102-roadmap-creation-phase.mdc**: AI role and instructions for Roadmap Creation  
- **103-task-decomposition-phase.mdc**: AI role and instructions for Task Decomposition
- **104-collaborative-execution-phase.mdc**: AI role and instructions for Collaborative Execution
- **105-continuous-refinement-phase.mdc**: AI role and instructions for Continuous Refinement

### Supporting Assets
- **tactical-phase-guide.md**: Complete guide to using the tactical approach
- **human-roles-by-phase.md**: Real-world human roles and responsibilities for each phase
- **phase-execution-template.md**: Template for executing each phase
- **templates/**: Intent, roadmap, and task breakdown templates

### How to Use
1. **Start with the Tactical Phase Guide** - Learn how to use the phase-specific rules
2. **Use Phase-Specific Cursor Rules** - Each phase has dedicated AI instructions
3. **Follow the Structured Process** - 4-step tactical process for each phase
4. **Use Templates and Checklists** - Ensure completeness and quality

## Integration with Feature Development

This playbook integrates with the **100-ai-feature-development.mdc** rule to provide a complete development workflow:

- **Playbook phases** provide tactical guidance and templates for planning and execution
- **100 rule** provides operational guardrails for CI, environment, observability, and delivery

### Continuous Improvement Integration

The playbook's continuous improvement approach integrates across all rule layers:

- **Phase-specific rules (101-105)** capture lessons learned and refinements
- **Feature development rule (100)** enforces improvement through reflection and template updates
- **Core development rule (004)** maintains improvement practices as baseline standards

## Next Steps

1. **Review the Tactical Phase Guide** - Understand the tactical approach
2. **Set up Phase-Specific Cursor Rules** - Ensure all rules are in place
3. **Start with Intent Capture** - Use the 101-intent-capture-phase.mdc rule
4. **Apply the playbook to your next project** - Follow the tactical process
5. **Iterate and refine based on experience** - Improve the approach over time

---

*This playbook is a living document. Update it based on your experience and evolving best practices.*


