# Supabase Schema Documentation

## Overview
This directory contains the database schema for Chef Chopsky's conversation analytics system. The schema is designed to store conversation data alongside LangSmith for data sovereignty and custom analytics.

## Tables

### 1. `conversation_runs`
Main table for tracking conversation sessions.

**Purpose**: Store high-level information about each conversation session.

**Key Fields**:
- `id`: Unique identifier for the conversation run
- `user_id`: User identifier (nullable for anonymous users)
- `session_id`: Groups related conversations together
- `status`: Current status (active, completed, abandoned)
- `total_tokens_used`: Total tokens consumed
- `total_cost`: Total cost in USD
- `average_response_time`: Average response time in milliseconds
- `user_satisfaction_score`: User rating (1-5)

### 2. `conversation_messages`
Individual messages within conversation runs.

**Purpose**: Store each message in the conversation with detailed metadata.

**Key Fields**:
- `conversation_run_id`: Links to conversation_runs table
- `role`: Message role (user, assistant, system)
- `content`: The actual message content
- `token_count`: Number of tokens in this message
- `response_time_ms`: Response time (NULL for user messages)
- `cost`: Cost in USD (0.00 for user messages)

### 3. `conversation_analytics`
Aggregated analytics data for each conversation run.

**Purpose**: Store computed analytics and quality metrics.

**Key Fields**:
- `conversation_run_id`: Links to conversation_runs table
- `completion_rate`: Percentage of conversation completion (0-100)
- `user_engagement_score`: Calculated engagement score (0-100)
- `conversation_quality_score`: AI-calculated quality score (0-100)
- `error_count`: Number of errors encountered
- `retry_count`: Number of retry attempts

## Indexes

### Performance Indexes
- `idx_conversation_runs_user_id_created_at`: User conversations by date
- `idx_conversation_runs_status_created_at`: Conversations by status and date
- `idx_conversation_messages_conversation_run_id_created_at`: Messages by conversation and date
- `idx_conversation_analytics_conversation_run_id`: Analytics by conversation

### Query Optimization
- Time-based queries: `created_at` indexes
- User-specific queries: `user_id` indexes
- Status filtering: `status` indexes
- Quality analysis: `quality_score` indexes

## Relationships

```
conversation_runs (1) ←→ (many) conversation_messages
conversation_runs (1) ←→ (1) conversation_analytics
```

## Data Flow

1. **New Conversation**: Create record in `conversation_runs`
2. **Message Exchange**: Add records to `conversation_messages`
3. **Conversation End**: Update `conversation_runs` status and totals
4. **Analytics Processing**: Create/update `conversation_analytics`

## Usage Examples

### Create a new conversation run
```sql
INSERT INTO conversation_runs (user_id, session_id, status)
VALUES ('user-123', 'session-456', 'active');
```

### Add a message
```sql
INSERT INTO conversation_messages (conversation_run_id, role, content, token_count)
VALUES ('run-uuid', 'user', 'Hello Chef Chopsky!', 5);
```

### Update conversation totals
```sql
UPDATE conversation_runs 
SET total_messages = 10, 
    total_tokens_used = 1500, 
    total_cost = 0.0025,
    status = 'completed'
WHERE id = 'run-uuid';
```

## Migration Files

- `001_create_conversation_runs.sql`: Creates the main conversation runs table
- `002_create_conversation_messages.sql`: Creates the messages table
- `003_create_conversation_analytics.sql`: Creates the analytics table

## Security Considerations

- All tables use UUID primary keys for security
- Foreign key constraints ensure data integrity
- Check constraints validate data ranges
- JSONB fields allow flexible metadata storage
- Indexes optimize query performance

## Future Enhancements

- Add conversation type classification
- Implement user feedback collection
- Add conversation flow analysis
- Create automated quality scoring
- Add A/B testing support
