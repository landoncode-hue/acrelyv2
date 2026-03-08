#!/bin/bash

# Reset password for test users in local Supabase
# This script uses the Supabase Admin API to reset passwords

SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-sb_secret_dummy}"
SUPABASE_URL="http://127.0.0.1:54321"

# Array of test users
declare -a users=(
  "sysadmin@test.acrely.com"
  "ceo@test.acrely.com"
  "md@test.acrely.com"
  "frontdesk@test.acrely.com"
  "agent@test.acrely.com"
  "customer@test.acrely.com"
)

# Get user ID and update password
for email in "${users[@]}"
do
  echo "Resetting password for $email..."
  
  # Get user ID
  user_id=$(psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c "SELECT id FROM auth.users WHERE email = '$email';")
  
  if [ -z "$user_id" ]; then
    echo "  ❌ User not found: $email"
    continue
  fi
  
  user_id=$(echo $user_id | xargs) # trim whitespace
  
  # Update password using Admin API
  response=$(curl -s -X PUT "${SUPABASE_URL}/auth/v1/admin/users/${user_id}" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"password\": \"password123\"}")
  
  if echo "$response" | grep -q "\"id\""; then
    echo "  ✅ Password reset successful for $email"
  else
    echo "  ❌ Failed to reset password for $email"
    echo "  Response: $response"
  fi
done

echo ""
echo "Password reset complete! All test users now have password: password123"
