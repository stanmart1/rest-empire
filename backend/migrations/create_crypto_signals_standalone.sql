-- Create crypto_signals table
CREATE TABLE IF NOT EXISTS crypto_signals (
    id SERIAL PRIMARY KEY,
    coin VARCHAR NOT NULL,
    signal_type VARCHAR NOT NULL,
    entry_price NUMERIC(20, 8) NOT NULL,
    target_price NUMERIC(20, 8),
    stop_loss NUMERIC(20, 8),
    current_price NUMERIC(20, 8),
    status VARCHAR NOT NULL DEFAULT 'active',
    description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crypto_signals_coin ON crypto_signals(coin);
CREATE INDEX IF NOT EXISTS idx_crypto_signals_status ON crypto_signals(status);
CREATE INDEX IF NOT EXISTS idx_crypto_signals_created_at ON crypto_signals(created_at);
