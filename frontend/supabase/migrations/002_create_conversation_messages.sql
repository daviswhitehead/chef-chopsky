-- Create conversation_messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_run_id UUID NOT NULL REFERENCES conversation_runs(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    response_time_ms INTEGER NULL, -- NULL for user messages, populated for AI responses
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0.00,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_run_id_created_at ON conversation_messages(conversation_run_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role ON conversation_messages(role);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at);

-- Add comments for documentation
COMMENT ON TABLE conversation_messages IS 'Individual messages within conversation runs';
COMMENT ON COLUMN conversation_messages.conversation_run_id IS 'Foreign key reference to conversation_runs table';
COMMENT ON COLUMN conversation_messages.role IS 'Message role: user, assistant, or system';
COMMENT ON COLUMN conversation_messages.content IS 'The actual message content';
COMMENT ON COLUMN conversation_messages.token_count IS 'Number of tokens in this message';
COMMENT ON COLUMN conversation_messages.response_time_ms IS 'Response time in milliseconds (NULL for user messages)';
COMMENT ON COLUMN conversation_messages.cost IS 'Cost in USD for this message (0.00 for user messages)';
COMMENT ON COLUMN conversation_messages.metadata IS 'Additional message data: model used, temperature, etc.';
