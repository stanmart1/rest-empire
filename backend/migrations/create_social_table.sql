-- Create social table for storing social media links
CREATE TABLE IF NOT EXISTS social (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default empty social links
INSERT INTO social (content) VALUES ('{"facebook":"","instagram":"","twitter":"","linkedin":""}')
ON CONFLICT DO NOTHING;
