-- Create tables that the frontend expects
-- These are temporary tables to get the frontend working
-- We'll migrate to the new conversation logging schema later

-- Conversations table (what the frontend expects)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (what the frontend expects)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Feedback table (what the frontend expects)
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    satisfaction INTEGER NOT NULL CHECK (satisfaction >= 1 AND satisfaction <= 5),
    feedback TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations (user_id);
CREATE INDEX idx_conversations_status ON conversations (status);
CREATE INDEX idx_conversations_created_at ON conversations (created_at DESC);
CREATE INDEX idx_conversations_updated_at ON conversations (updated_at DESC);

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_timestamp ON messages (timestamp ASC);
CREATE INDEX idx_messages_role ON messages (role);

CREATE INDEX idx_feedback_conversation_id ON feedback (conversation_id);
CREATE INDEX idx_feedback_user_id ON feedback (user_id);
CREATE INDEX idx_feedback_satisfaction ON feedback (satisfaction);
CREATE INDEX idx_feedback_created_at ON feedback (created_at DESC);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations (allow anonymous access)
CREATE POLICY "Allow all operations on conversations" ON conversations
    FOR ALL USING (true);

-- Create RLS policies for messages (allow anonymous access)
CREATE POLICY "Allow all operations on messages" ON messages
    FOR ALL USING (true);

-- Create RLS policies for feedback (allow anonymous access)
CREATE POLICY "Allow all operations on feedback" ON feedback
    FOR ALL USING (true);

-- Add comments
COMMENT ON TABLE conversations IS 'Frontend conversations table - temporary until migration to conversation_runs';
COMMENT ON TABLE messages IS 'Frontend messages table - temporary until migration to conversation_messages';
COMMENT ON TABLE feedback IS 'Frontend feedback table - temporary until migration to conversation_analytics';
