# Cursor Rules Organization

This directory contains organized Cursor rules with clear priority levels to prevent conflicts and ensure consistent AI behavior.

## 🎯 Priority System

Rules are numbered by priority (001-299), with lower numbers having higher priority:

### Priority 001-099: Core Rules (Always Applied)
- **001-core-conventions.mdc**: Project foundation, architecture, and critical environment rules
- **002-production-safety.mdc**: Production safety rules to prevent mock mode and ensure fail-fast behavior
- **003-terminal-safety.mdc**: Terminal safety and process management
- **004-ai-service-development.mdc**: AI service development and mock mode prevention
- **005-ai-development-playbook.mdc**: Comprehensive AI development playbook rules

### Priority 100-199: Integration Rules (Conditionally Applied)
- **100-ai-feature-development.mdc**: AI-first feature development workflow
- **101-intent-capture-phase.mdc**: AI role and instructions for Intent Capture phase
- **102-roadmap-creation-phase.mdc**: AI role and instructions for Roadmap Creation phase
- **103-task-decomposition-phase.mdc**: AI role and instructions for Task Decomposition phase
- **104-collaborative-execution-phase.mdc**: AI role and instructions for Collaborative Execution phase
- **105-continuous-refinement-phase.mdc**: AI role and instructions for Continuous Refinement phase
- **110-automated-testing.mdc**: Testing strategy and best practices
- **120-pull-request-preparation.mdc**: PR preparation and code quality

### Priority 200-299: Pattern/Role Rules (Context-Aware)
- **200-playwright-test-generator.mdc**: Playwright test generation using MCP tools

## 🔧 Rule Configuration

Each rule file includes:
- **Priority**: Numerical priority (001-299)
- **Description**: Clear description of the rule's purpose
- **Globs**: File patterns where the rule applies
- **alwaysApply**: Whether the rule is always active or context-dependent
- **Tools**: Specific tools required (for tool-specific rules)

## 🚨 Conflict Resolution

When rules conflict:
1. **Higher priority rules override lower priority rules**
2. **Core rules (001-099) always take precedence**
3. **Integration rules (100-199) can be overridden by core rules**
4. **Pattern/Role rules (200-299) only apply in their context**

## 📋 Rule Categories

### Core Rules (Always Active)
- Project conventions and architecture
- Terminal safety and process management
- AI service development standards
- Comprehensive development playbook rules

### Integration Rules (Context-Dependent)
- AI feature development workflow
- Phase-specific AI facilitation (101-105)
- Automated testing strategies
- Pull request preparation

### Pattern/Role Rules (Context-Aware)
- Playwright test generation
- Other MCP tool integrations

## 🎯 Usage Guidelines

1. **Core rules** ensure consistent project standards
2. **Integration rules** provide guidance for specific development phases
3. **Pattern/Role rules** activate when using specific tools or patterns
4. **Priority system** prevents conflicts and ensures predictable behavior

## 🔗 Integration with AI Development Playbook

This rule system integrates with the AI Development Playbook:

- **Core Rules (001-099)**: Foundation for all development work
- **Integration Rules (100-199)**: Operationalize feature delivery and phase execution
- **Pattern/Role Rules (200-299)**: Provide specialized tool and pattern support

The system supports continuous improvement through:
- Phase-specific rules (101-105) capturing lessons learned
- Feature development rules (100) enforcing improvement through reflection
- Core rules (004) maintaining improvement practices as baseline standards

## 🔄 Maintenance

- Review and update rules regularly
- Add new rules with appropriate priority levels
- Remove or consolidate redundant rules
- Test rule interactions to ensure no conflicts

---

*This organization ensures consistent AI behavior while preventing rule conflicts.*
