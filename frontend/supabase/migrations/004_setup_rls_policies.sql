-- Enable Row Level Security on all tables
ALTER TABLE conversation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_runs table

-- Policy 1: Users can view their own conversation runs
CREATE POLICY "Users can view own conversation runs" ON conversation_runs
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL -- Allow viewing anonymous conversations
    );

-- Policy 2: Users can insert their own conversation runs
CREATE POLICY "Users can insert own conversation runs" ON conversation_runs
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL -- Allow anonymous conversations
    );

-- Policy 3: Users can update their own conversation runs
CREATE POLICY "Users can update own conversation runs" ON conversation_runs
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id IS NULL -- Allow updating anonymous conversations
    );

-- Policy 4: Service role can do everything (for API operations)
CREATE POLICY "Service role full access" ON conversation_runs
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- RLS Policies for conversation_messages table

-- Policy 1: Users can view messages from their own conversations
CREATE POLICY "Users can view own conversation messages" ON conversation_messages
    FOR SELECT USING (
        conversation_run_id IN (
            SELECT id FROM conversation_runs 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Policy 2: Users can insert messages to their own conversations
CREATE POLICY "Users can insert own conversation messages" ON conversation_messages
    FOR INSERT WITH CHECK (
        conversation_run_id IN (
            SELECT id FROM conversation_runs 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Policy 3: Users can update messages in their own conversations
CREATE POLICY "Users can update own conversation messages" ON conversation_messages
    FOR UPDATE USING (
        conversation_run_id IN (
            SELECT id FROM conversation_runs 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Policy 4: Service role can do everything (for API operations)
CREATE POLICY "Service role full access messages" ON conversation_messages
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- RLS Policies for conversation_analytics table

-- Policy 1: Users can view analytics from their own conversations
CREATE POLICY "Users can view own conversation analytics" ON conversation_analytics
    FOR SELECT USING (
        conversation_run_id IN (
            SELECT id FROM conversation_runs 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Policy 2: Users can insert analytics for their own conversations
CREATE POLICY "Users can insert own conversation analytics" ON conversation_analytics
    FOR INSERT WITH CHECK (
        conversation_run_id IN (
            SELECT id FROM conversation_runs 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Policy 3: Users can update analytics for their own conversations
CREATE POLICY "Users can update own conversation analytics" ON conversation_analytics
    FOR UPDATE USING (
        conversation_run_id IN (
            SELECT id FROM conversation_runs 
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

-- Policy 4: Service role can do everything (for API operations)
CREATE POLICY "Service role full access analytics" ON conversation_analytics
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- Add comments for documentation
COMMENT ON POLICY "Users can view own conversation runs" ON conversation_runs IS 'Allows users to view their own conversation runs and anonymous conversations';
COMMENT ON POLICY "Users can insert own conversation runs" ON conversation_runs IS 'Allows users to create conversation runs for themselves or anonymously';
COMMENT ON POLICY "Users can update own conversation runs" ON conversation_runs IS 'Allows users to update their own conversation runs';
COMMENT ON POLICY "Service role full access" ON conversation_runs IS 'Allows service role (API) to perform all operations';

COMMENT ON POLICY "Users can view own conversation messages" ON conversation_messages IS 'Allows users to view messages from their own conversations';
COMMENT ON POLICY "Users can insert own conversation messages" ON conversation_messages IS 'Allows users to add messages to their own conversations';
COMMENT ON POLICY "Users can update own conversation messages" ON conversation_messages IS 'Allows users to update messages in their own conversations';
COMMENT ON POLICY "Service role full access messages" ON conversation_messages IS 'Allows service role (API) to perform all operations on messages';

COMMENT ON POLICY "Users can view own conversation analytics" ON conversation_analytics IS 'Allows users to view analytics from their own conversations';
COMMENT ON POLICY "Users can insert own conversation analytics" ON conversation_analytics IS 'Allows users to create analytics for their own conversations';
COMMENT ON POLICY "Users can update own conversation analytics" ON conversation_analytics IS 'Allows users to update analytics for their own conversations';
COMMENT ON POLICY "Service role full access analytics" ON conversation_analytics IS 'Allows service role (API) to perform all operations on analytics';
