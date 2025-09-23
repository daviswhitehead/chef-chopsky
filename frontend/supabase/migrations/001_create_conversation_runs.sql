-- Create conversation_runs table
CREATE TABLE IF NOT EXISTS conversation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL, -- nullable for anonymous users
    session_id UUID NOT NULL DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    total_messages INTEGER NOT NULL DEFAULT 0,
    total_tokens_used INTEGER NOT NULL DEFAULT 0,
    total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0.00,
    average_response_time DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    user_satisfaction_score INTEGER NULL CHECK (user_satisfaction_score >= 1 AND user_satisfaction_score <= 5),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_runs_user_id_created_at ON conversation_runs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_runs_status_created_at ON conversation_runs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_runs_created_at ON conversation_runs(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_runs_session_id ON conversation_runs(session_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_runs_updated_at 
    BEFORE UPDATE ON conversation_runs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE conversation_runs IS 'Main table for tracking conversation sessions with Chef Chopsky';
COMMENT ON COLUMN conversation_runs.user_id IS 'User identifier, nullable for anonymous users';
COMMENT ON COLUMN conversation_runs.session_id IS 'Unique session identifier for grouping related conversations';
COMMENT ON COLUMN conversation_runs.status IS 'Current status of the conversation: active, completed, or abandoned';
COMMENT ON COLUMN conversation_runs.total_tokens_used IS 'Total tokens consumed across all messages in this conversation';
COMMENT ON COLUMN conversation_runs.total_cost IS 'Total cost in USD for this conversation';
COMMENT ON COLUMN conversation_runs.average_response_time IS 'Average response time in milliseconds';
COMMENT ON COLUMN conversation_runs.user_satisfaction_score IS 'User rating from 1-5, NULL if not provided';
COMMENT ON COLUMN conversation_runs.metadata IS 'Additional session data, user preferences, etc.';
