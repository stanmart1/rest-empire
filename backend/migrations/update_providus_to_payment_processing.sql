-- Update Providus gateway configuration from account generation to payment processing
UPDATE payment_gateways 
SET config_fields = '[{"key": "merchant_id", "label": "Merchant ID", "type": "text"}, {"key": "api_key", "label": "API Key", "type": "password"}, {"key": "callback_url", "label": "Callback URL", "type": "text"}]'
WHERE gateway_id = 'providus';

-- Clear any existing config values to force reconfiguration
UPDATE payment_gateways 
SET config_values = '{}'
WHERE gateway_id = 'providus';
