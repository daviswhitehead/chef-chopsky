-- Test script to validate Supabase schema
-- Run this in Supabase SQL Editor after applying migrations

-- Test 1: Create a test conversation run
INSERT INTO conversation_runs (user_id, session_id, status, total_messages, total_tokens_used, total_cost, average_response_time)
VALUES ('test-user-123', 'test-session-456', 'active', 0, 0, 0.00, 0.00);

-- Get the conversation run ID for testing
-- (You'll need to replace 'your-run-id' with the actual UUID from the insert above)
-- SELECT id FROM conversation_runs WHERE user_id = 'test-user-123' LIMIT 1;

-- Test 2: Add messages to the conversation
-- Replace 'your-run-id' with the actual UUID from step 1
INSERT INTO conversation_messages (conversation_run_id, role, content, token_count, response_time_ms, cost)
VALUES 
  ('your-run-id', 'user', 'Hello Chef Chopsky!', 5, NULL, 0.00),
  ('your-run-id', 'assistant', 'Hello! How can I help you with meal planning today?', 12, 1500, 0.0003);

-- Test 3: Create analytics for the conversation
-- Replace 'your-run-id' with the actual UUID from step 1
INSERT INTO conversation_analytics (conversation_run_id, completion_rate, user_engagement_score, conversation_quality_score, error_count, retry_count)
VALUES ('your-run-id', 100.00, 85.50, 92.30, 0, 0);

-- Test 4: Update conversation run with totals
-- Replace 'your-run-id' with the actual UUID from step 1
UPDATE conversation_runs 
SET total_messages = 2, 
    total_tokens_used = 17, 
    total_cost = 0.0003,
    average_response_time = 1500.00,
    status = 'completed'
WHERE user_id = 'test-user-123';

-- Test 5: Verify data integrity with joins
SELECT 
    cr.id,
    cr.user_id,
    cr.status,
    cr.total_messages,
    cr.total_tokens_used,
    cr.total_cost,
    COUNT(cm.id) as message_count,
    ca.completion_rate,
    ca.conversation_quality_score
FROM conversation_runs cr
LEFT JOIN conversation_messages cm ON cr.id = cm.conversation_run_id
LEFT JOIN conversation_analytics ca ON cr.id = ca.conversation_run_id
WHERE cr.user_id = 'test-user-123'
GROUP BY cr.id, cr.user_id, cr.status, cr.total_messages, cr.total_tokens_used, cr.total_cost, ca.completion_rate, ca.conversation_quality_score;

-- Test 6: Test RLS policies (should only show test user's data)
-- This should only return the test conversation we created
SELECT * FROM conversation_runs WHERE user_id = 'test-user-123';

-- Test 7: Clean up test data
DELETE FROM conversation_analytics WHERE conversation_run_id IN (SELECT id FROM conversation_runs WHERE user_id = 'test-user-123');
DELETE FROM conversation_messages WHERE conversation_run_id IN (SELECT id FROM conversation_runs WHERE user_id = 'test-user-123');
DELETE FROM conversation_runs WHERE user_id = 'test-user-123';

-- Test 8: Verify indexes are working
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM conversation_runs 
WHERE user_id = 'test-user-123' 
ORDER BY created_at DESC;

-- Test 9: Check table comments and structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('conversation_runs', 'conversation_messages', 'conversation_analytics')
ORDER BY table_name, ordinal_position;
