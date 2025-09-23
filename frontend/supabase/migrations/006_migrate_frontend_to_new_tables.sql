-- Migration script to move data from frontend tables to new conversation logging tables
-- This creates a unified data model

-- Step 1: Migrate conversations to conversation_runs
INSERT INTO conversation_runs (
    id,
    user_id,
    session_id,
    status,
    started_at,
    completed_at,
    total_messages,
    total_tokens_used,
    total_cost,
    average_response_time,
    metadata,
    created_at,
    updated_at
)
SELECT 
    c.id as id,
    NULL as user_id, -- Convert text user_id to NULL for now (we'll handle this later)
    c.id as session_id, -- Use conversation ID as session ID
    CASE 
        WHEN c.status = 'active' THEN 'active'
        WHEN c.status = 'completed' THEN 'completed'
        ELSE 'abandoned'
    END as status,
    c.created_at as started_at,
    CASE 
        WHEN c.status = 'completed' THEN c.updated_at
        ELSE NULL
    END as completed_at,
    (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as total_messages,
    0 as total_tokens_used, -- Will be calculated from conversation_messages
    0.0 as total_cost, -- Will be calculated from conversation_messages
    0.0 as average_response_time, -- Will be calculated from conversation_messages
    jsonb_build_object(
        'title', c.title,
        'original_user_id', c.user_id,
        'frontend_metadata', c.metadata
    ) as metadata,
    c.created_at,
    c.updated_at
FROM conversations c
WHERE NOT EXISTS (
    SELECT 1 FROM conversation_runs cr WHERE cr.id = c.id
);

-- Step 2: Migrate messages to conversation_messages
INSERT INTO conversation_messages (
    id,
    conversation_run_id,
    role,
    content,
    token_count,
    response_time_ms,
    cost,
    metadata,
    created_at
)
SELECT 
    m.id,
    m.conversation_id as conversation_run_id,
    m.role,
    m.content,
    CASE 
        WHEN m.role = 'user' THEN LENGTH(m.content) / 4 -- Rough estimate
        ELSE LENGTH(m.content) / 4 -- Rough estimate
    END as token_count,
    NULL as response_time_ms, -- Not available in old data
    0.0 as cost, -- Not available in old data
    jsonb_build_object(
        'original_timestamp', m.timestamp,
        'frontend_metadata', m.metadata
    ) as metadata,
    COALESCE(m.timestamp, NOW()) as created_at
FROM messages m
WHERE EXISTS (
    SELECT 1 FROM conversation_runs cr WHERE cr.id = m.conversation_id
)
AND NOT EXISTS (
    SELECT 1 FROM conversation_messages cm WHERE cm.id = m.id
);

-- Step 3: Update conversation_runs with calculated totals
UPDATE conversation_runs 
SET 
    total_tokens_used = (
        SELECT COALESCE(SUM(token_count), 0) 
        FROM conversation_messages 
        WHERE conversation_run_id = conversation_runs.id
    ),
    total_cost = (
        SELECT COALESCE(SUM(cost), 0.0) 
        FROM conversation_messages 
        WHERE conversation_run_id = conversation_runs.id
    ),
    average_response_time = (
        SELECT COALESCE(AVG(response_time_ms), 0.0) 
        FROM conversation_messages 
        WHERE conversation_run_id = conversation_runs.id 
        AND response_time_ms IS NOT NULL
    )
WHERE id IN (
    SELECT DISTINCT conversation_run_id 
    FROM conversation_messages 
    WHERE conversation_run_id IS NOT NULL
);

-- Step 4: Create analytics records for migrated conversations
INSERT INTO conversation_analytics (
    id,
    conversation_run_id,
    completion_rate,
    user_engagement_score,
    conversation_quality_score,
    error_count,
    retry_count,
    analytics_metadata,
    created_at
)
SELECT 
    gen_random_uuid() as id,
    cr.id as conversation_run_id,
    CASE 
        WHEN cr.status = 'completed' THEN 100.0
        WHEN cr.status = 'active' THEN 50.0
        ELSE 0.0
    END as completion_rate,
    -- Simple engagement score based on message count and conversation length
    LEAST(100.0, GREATEST(0.0, 
        (cr.total_messages * 10.0) + 
        (EXTRACT(EPOCH FROM (COALESCE(cr.completed_at, NOW()) - cr.started_at)) / 60.0 * 5.0)
    )) as user_engagement_score,
    -- Simple quality score based on message count and token efficiency
    LEAST(100.0, GREATEST(0.0,
        (cr.total_messages * 15.0) + 
        (CASE WHEN cr.total_messages > 0 THEN cr.total_tokens_used / cr.total_messages ELSE 0 END * 0.5)
    )) as conversation_quality_score,
    0 as error_count, -- Not available in old data
    0 as retry_count, -- Not available in old data
    jsonb_build_object(
        'migration_source', 'frontend_tables',
        'migrated_at', NOW(),
        'original_conversation_id', cr.id
    ) as analytics_metadata,
    NOW() as created_at
FROM conversation_runs cr
WHERE NOT EXISTS (
    SELECT 1 FROM conversation_analytics ca WHERE ca.conversation_run_id = cr.id
);

-- Step 5: Add comments to track the migration
COMMENT ON TABLE conversations IS 'DEPRECATED: Use conversation_runs instead. This table will be removed after migration is complete.';
COMMENT ON TABLE messages IS 'DEPRECATED: Use conversation_messages instead. This table will be removed after migration is complete.';
COMMENT ON TABLE feedback IS 'DEPRECATED: Use conversation_analytics instead. This table will be removed after migration is complete.';

-- Step 6: Create a view for backward compatibility (temporary)
CREATE OR REPLACE VIEW conversations_legacy AS
SELECT 
    cr.id,
    COALESCE(cr.metadata->>'original_user_id', 'anonymous') as user_id,
    cr.metadata->>'title' as title,
    cr.status,
    cr.metadata->'frontend_metadata' as metadata,
    cr.created_at,
    cr.updated_at
FROM conversation_runs cr;

CREATE OR REPLACE VIEW messages_legacy AS
SELECT 
    cm.id,
    cm.conversation_run_id as conversation_id,
    cm.role,
    cm.content,
    cm.created_at as timestamp,
    cm.metadata->'frontend_metadata' as metadata
FROM conversation_messages cm;

-- Add comments to the views
COMMENT ON VIEW conversations_legacy IS 'Legacy view for backward compatibility. Use conversation_runs directly.';
COMMENT ON VIEW messages_legacy IS 'Legacy view for backward compatibility. Use conversation_messages directly.';
