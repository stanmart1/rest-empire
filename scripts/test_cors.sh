#!/bin/bash

# CORS Testing Script for Rest Empire API
# Usage: ./test_cors.sh [environment]
# Example: ./test_cors.sh production

ENVIRONMENT=${1:-production}

if [ "$ENVIRONMENT" = "production" ]; then
    API_URL="https://api.restempire.com"
    ORIGIN="https://restempire.com"
else
    API_URL="http://localhost:8000"
    ORIGIN="http://localhost:8080"
fi

echo "=========================================="
echo "Testing CORS Configuration"
echo "=========================================="
echo "Environment: $ENVIRONMENT"
echo "API URL: $API_URL"
echo "Origin: $ORIGIN"
echo "=========================================="
echo ""

echo "1. Testing Health Endpoint (GET)..."
curl -X GET "$API_URL/health" \
  -H "Origin: $ORIGIN" \
  -v 2>&1 | grep -i "access-control"
echo ""

echo "2. Testing Events Endpoint Preflight (OPTIONS)..."
curl -X OPTIONS "$API_URL/api/v1/events/" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization,X-CSRF-Token" \
  -v 2>&1 | grep -i "access-control"
echo ""

echo "3. Testing with www subdomain..."
curl -X OPTIONS "$API_URL/api/v1/events/" \
  -H "Origin: https://www.restempire.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v 2>&1 | grep -i "access-control"
echo ""

echo "=========================================="
echo "Expected Headers:"
echo "  Access-Control-Allow-Origin: $ORIGIN"
echo "  Access-Control-Allow-Credentials: true"
echo "  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH"
echo "=========================================="
