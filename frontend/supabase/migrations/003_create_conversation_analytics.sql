-- Create conversation_analytics table
CREATE TABLE IF NOT EXISTS conversation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_run_id UUID NOT NULL REFERENCES conversation_runs(id) ON DELETE CASCADE,
    completion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (completion_rate >= 0.00 AND completion_rate <= 100.00),
    user_engagement_score DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (user_engagement_score >= 0.00 AND user_engagement_score <= 100.00),
    conversation_quality_score DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (conversation_quality_score >= 0.00 AND conversation_quality_score <= 100.00),
    error_count INTEGER NOT NULL DEFAULT 0,
    retry_count INTEGER NOT NULL DEFAULT 0,
    analytics_metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_conversation_run_id ON conversation_analytics(conversation_run_id);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_completion_rate ON conversation_analytics(completion_rate);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_quality_score ON conversation_analytics(conversation_quality_score);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_created_at ON conversation_analytics(created_at);

-- Add comments for documentation
COMMENT ON TABLE conversation_analytics IS 'Aggregated analytics data for each conversation run';
COMMENT ON COLUMN conversation_analytics.conversation_run_id IS 'Foreign key reference to conversation_runs table';
COMMENT ON COLUMN conversation_analytics.completion_rate IS 'Percentage of conversation completion (0-100)';
COMMENT ON COLUMN conversation_analytics.user_engagement_score IS 'Calculated user engagement score (0-100)';
COMMENT ON COLUMN conversation_analytics.conversation_quality_score IS 'AI-calculated conversation quality score (0-100)';
COMMENT ON COLUMN conversation_analytics.error_count IS 'Number of errors encountered during conversation';
COMMENT ON COLUMN conversation_analytics.retry_count IS 'Number of retry attempts made';
COMMENT ON COLUMN conversation_analytics.analytics_metadata IS 'Additional analytics data and computed metrics';
