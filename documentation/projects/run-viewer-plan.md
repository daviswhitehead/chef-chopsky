# Run Viewer Feature Plan

## Overview
Build a comprehensive run viewer system to analyze user conversations with Chef Chopsky, identify improvement opportunities, and create feedback loops for product development acceleration.

## Strategic Decision: Dual Logging Strategy
**Decision**: Integrate LangSmith for analytics while maintaining Supabase as primary data store.

**Rationale**: 
- LangSmith provides exactly the analytics and evaluation framework needed for conversation quality analysis
- Built-in user behavior pattern analysis aligns with primary goals
- Evaluation framework perfect for creating tests/evals to ensure product improvement
- Supabase backup ensures no vendor lock-in and provides data portability
- Production-ready solution used by elite AI companies with data sovereignty

## Phase 1: LangSmith Setup & Integration (Week 1)

### 1.1 LangSmith Account & Project Setup
- [ ] Create LangSmith account and project
- [ ] Configure project settings for Chef Chopsky
- [ ] Set up API keys and authentication
- [ ] Configure data retention and privacy settings

### 1.2 Chat API Integration
- [ ] Install LangSmith SDK in Next.js app
- [ ] Modify existing chat API route (`/app/api/ai/chat/route.ts`) to integrate LangSmith tracing
- [ ] Add conversation session tracking
- [ ] Implement automatic logging of all AI interactions
- [ ] Test data capture with sample conversations

### 1.3 Frontend Chat Interface Debugging
- [ ] Review and fix existing chat interface prototype issues
- [ ] Ensure reliable message sending and receiving
- [ ] Fix any UI/UX bugs that prevent proper conversation flow
- [ ] Test chat interface stability with LangSmith integration
- [ ] Verify conversation persistence and session management

### 1.4 Supabase Schema Design
- [ ] Design conversation runs table schema
- [ ] Create messages table for individual conversation messages
- [ ] Set up conversation metadata table (session info, user data, performance metrics)
- [ ] Design indexes for efficient querying and analytics
- [ ] Set up RLS (Row Level Security) policies for data access

### 1.5 Dual Logging Implementation
- [ ] Implement dual logging: LangSmith + Supabase
- [ ] Create logging service that writes to both systems simultaneously
- [ ] Set up conversation metadata (user_id, session_id, basic session info)
- [ ] Set up basic error tracking and logging
- [ ] Test dual logging with sample conversations

## Phase 2: Core Run Viewer Dashboard (Week 2)

### 2.1 LangSmith Dashboard Access
- [ ] Set up LangSmith dashboard access
- [ ] Configure custom views for Chef Chopsky-specific metrics
- [ ] Set up conversation flow visualization
- [ ] Create response quality metrics dashboard

### 2.2 Supabase Data Validation
- [ ] Verify all conversation data is properly captured in Supabase
- [ ] Test data integrity and consistency between LangSmith and Supabase
- [ ] Set up basic analytics queries for future custom interface
- [ ] Document Supabase data structure for future development

### 2.3 LangSmith Analytics Focus
- [ ] Build conversation flow analysis views in LangSmith
- [ ] Create user behavior pattern dashboards in LangSmith
- [ ] Set up response quality metrics (completion rates, user satisfaction)
- [ ] Configure performance metrics (response time, token usage, costs)

### 2.4 Individual Run Inspection
- [ ] Set up detailed run inspection interface in LangSmith
- [ ] Configure debugging tools for individual conversations
- [ ] Add error log analysis capabilities
- [ ] Implement conversation replay functionality

## Phase 3: Advanced Analytics & Evaluation Framework (Week 3)

### 3.1 Conversation Quality Analysis
- [ ] Set up automated conversation quality scoring
- [ ] Create metrics for conversation completion rates
- [ ] Implement user satisfaction tracking
- [ ] Build conversation flow optimization insights

### 3.2 User Behavior Pattern Analysis
- [ ] Analyze common conversation paths and user journeys
- [ ] Identify where users get stuck or drop off
- [ ] Track session lengths and engagement patterns
- [ ] Create user behavior insights dashboard
- [ ] **Add conversation type classification** based on discovered patterns (meal_planning, cooking_help, etc.)

### 3.3 Evaluation Framework
- [ ] Set up automated evaluation tests for conversation quality
- [ ] Create regression tests to ensure product improvements
- [ ] Implement A/B testing framework for conversation flows
- [ ] Build feedback loop system for continuous improvement

## Phase 4: Integration & Optimization (Week 4)

### 4.1 Performance Optimization
- [ ] Optimize data capture performance
- [ ] Implement efficient data querying
- [ ] Set up automated cleanup of old data
- [ ] Configure cost optimization settings

### 4.2 Documentation & Training
- [ ] Document LangSmith integration and usage
- [ ] Create run viewer usage guide
- [ ] Set up monitoring and alerting
- [ ] Create evaluation framework documentation

## Supabase Schema Design

### Core Tables

#### `conversation_runs`
```sql
- id (uuid, primary key)
- user_id (uuid, nullable for anonymous users)
- session_id (uuid)
- status (text: 'active', 'completed', 'abandoned')
- started_at (timestamp)
- completed_at (timestamp, nullable)
- total_messages (integer)
- total_tokens_used (integer)
- total_cost (decimal)
- average_response_time (decimal)
- user_satisfaction_score (integer, nullable)
- metadata (jsonb: session info, user preferences, etc.)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `conversation_messages`
```sql
- id (uuid, primary key)
- conversation_run_id (uuid, foreign key)
- role (text: 'user', 'assistant', 'system')
- content (text)
- token_count (integer)
- response_time_ms (integer)
- cost (decimal)
- metadata (jsonb: model used, temperature, etc.)
- created_at (timestamp)
```

#### `conversation_analytics`
```sql
- id (uuid, primary key)
- conversation_run_id (uuid, foreign key)
- completion_rate (decimal)
- user_engagement_score (decimal)
- conversation_quality_score (decimal)
- error_count (integer)
- retry_count (integer)
- analytics_metadata (jsonb)
- created_at (timestamp)
```

### Indexes for Performance
- `conversation_runs(user_id, created_at)`
- `conversation_runs(status, created_at)`
- `conversation_messages(conversation_run_id, created_at)`
- `conversation_runs(created_at)` (for time-based queries)

## Technical Architecture

### Data Flow
1. **User Interaction** → Next.js Chat Interface
2. **Chat API** → Dual Logging Service
3. **Dual Logging** → LangSmith Tracing + Supabase Storage
4. **LangSmith** → Analytics, Evaluation, Advanced Features
5. **Supabase** → Primary Data Store, Custom Views, Data Portability
6. **Run Viewer** → LangSmith Dashboard (MVP) + Future Supabase Custom Interface

### Key Components
- **Dual Logging Service**: Simultaneous LangSmith + Supabase logging
- **LangSmith SDK**: Automatic conversation tracing and analytics
- **Supabase Schema**: Structured conversation data storage
- **Evaluation Framework**: Automated quality testing
- **Analytics Dashboard**: User behavior insights (LangSmith MVP)
- **Future Custom Interface**: Supabase-based custom views

## Success Metrics

### Phase 1 Success
- [ ] All conversations automatically logged to both LangSmith and Supabase
- [ ] Basic conversation metadata captured in both systems
- [ ] Supabase schema designed and implemented
- [ ] Error tracking functional

### Phase 2 Success
- [ ] Comprehensive run viewer dashboard operational in LangSmith
- [ ] Individual conversation inspection working
- [ ] Basic analytics and metrics available
- [ ] Supabase data validation complete and documented

### Phase 3 Success
- [ ] Conversation quality analysis providing actionable insights
- [ ] User behavior patterns clearly identified
- [ ] Evaluation framework preventing regressions

### Phase 4 Success
- [ ] Fully integrated system with automated reporting
- [ ] Clear feedback loops accelerating product development
- [ ] Comprehensive documentation and monitoring

## Risk Mitigation

### Technical Risks
- **LangSmith Learning Curve**: Allocate extra time for learning and setup
- **Integration Complexity**: Start with basic integration, iterate
- **Performance Impact**: Monitor API response times, optimize as needed
- **Chat Interface Stability**: Existing prototype may need debugging and fixes before reliable data capture

### Business Risks
- **Cost Management**: Monitor LangSmith usage and costs
- **Data Privacy**: Ensure compliance with user data requirements
- **Vendor Lock-in**: Consider data export capabilities

## Future Enhancements (Post-MVP)

### Advanced Features
- [ ] **Custom Supabase Run Viewer Interface** (if LangSmith gaps are identified)
- [ ] **Next.js App Integration**
  - [ ] Create admin interface in Next.js app for LangSmith integration
  - [ ] Add navigation to run viewer from main chat interface
  - [ ] Implement custom analytics views if needed
  - [ ] Set up automated reporting and alerts
- [ ] Custom evaluation metrics specific to Chef Chopsky
- [ ] Automated conversation optimization suggestions
- [ ] Integration with user feedback collection
- [ ] Advanced A/B testing for conversation flows
- [ ] Export capabilities for external analysis

### Scaling Considerations
- [ ] Multi-tenant support for different user segments
- [ ] Advanced analytics for product team collaboration
- [ ] Integration with other product analytics tools
- [ ] Custom reporting and dashboard creation

## Implementation Notes

### Development Approach
- **Iterative Development**: Build and test each phase before moving to next
- **User-Centric**: Focus on insights that drive product improvement
- **Data-Driven**: Use analytics to guide feature development
- **Continuous Learning**: Leverage LangSmith's evaluation framework

### Quality Assurance
- [ ] Test data capture with various conversation types
- [ ] Validate analytics accuracy with known data
- [ ] Ensure privacy and security compliance
- [ ] Performance testing under load

---

*This plan prioritizes getting comprehensive conversation analytics and evaluation capabilities operational quickly while building a foundation for long-term product development acceleration.*
