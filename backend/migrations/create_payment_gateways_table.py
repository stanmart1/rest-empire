import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)

def upgrade():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS payment_gateways (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                gateway_id VARCHAR UNIQUE NOT NULL,
                is_enabled BOOLEAN DEFAULT FALSE,
                config_fields JSON NOT NULL,
                config_values JSON DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_payment_gateways_gateway_id ON payment_gateways(gateway_id);
        """))
        conn.commit()
        print("✓ Created payment_gateways table")
        
        # Insert default gateways
        conn.execute(text("""
            INSERT INTO payment_gateways (name, gateway_id, config_fields) VALUES
            ('GTPay', 'gtpay', '[{"key": "merchant_id", "label": "Merchant ID", "type": "text"}, {"key": "api_key", "label": "API Key", "type": "password"}, {"key": "callback_url", "label": "Callback URL", "type": "text"}]'),
            ('Providus', 'providus', '[{"key": "account_number", "label": "Account Number", "type": "text"}, {"key": "bank_code", "label": "Bank Code", "type": "text"}, {"key": "api_key", "label": "API Key", "type": "password"}]'),
            ('Paystack', 'paystack', '[{"key": "public_key", "label": "Public Key", "type": "text"}, {"key": "secret_key", "label": "Secret Key", "type": "password"}, {"key": "callback_url", "label": "Callback URL", "type": "text"}]'),
            ('Crypto', 'crypto', '[{"key": "wallet_address", "label": "USDT TRC20 Wallet Address", "type": "text"}]'),
            ('Bank Transfer', 'bank_transfer', '[{"key": "bank_name", "label": "Bank Name", "type": "text"}, {"key": "account_number", "label": "Account Number", "type": "text"}, {"key": "account_name", "label": "Account Name", "type": "text"}]')
            ON CONFLICT (gateway_id) DO NOTHING;
        """))
        conn.commit()
        print("✓ Inserted default payment gateways")

def downgrade():
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS payment_gateways;"))
        conn.commit()
        print("✓ Dropped payment_gateways table")

if __name__ == "__main__":
    upgrade()
