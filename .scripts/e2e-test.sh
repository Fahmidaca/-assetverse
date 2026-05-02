#!/bin/bash
set +e

BASE="http://localhost:3001"
PASS_COUNT=0
FAIL_COUNT=0
FAILURES=""

assert_status() {
  local got="$1"
  local expected="$2"
  local name="$3"
  if [ "$got" = "$expected" ]; then
    echo "  PASS  $name (HTTP $got)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "  FAIL  $name -- expected $expected got $got"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAILURES="$FAILURES\n  - $name: expected $expected got $got"
  fi
}

echo "================================="
echo "  AssetVerse E2E API Test Suite"
echo "================================="

TS=$(date +%s)
HR_EMAIL="hr.e2e.${TS}@test.com"
EMP_EMAIL="emp.e2e.${TS}@test.com"

echo ""
echo "[1] AUTH"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"E2E HR\",\"email\":\"$HR_EMAIL\",\"password\":\"123456\",\"role\":\"hr\",\"companyName\":\"E2E Co\",\"dateOfBirth\":\"1990-05-15\"}")
assert_status "$RES" "201" "Register HR"
HR_TOKEN=$(grep -oE '"token":"[^"]+"' /tmp/r.json | sed 's/"token":"//;s/"$//')

TOMORROW=$(date -d "+5 days" +%Y-%m-%d 2>/dev/null || echo "2026-05-07")
RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"E2E Employee\",\"email\":\"$EMP_EMAIL\",\"password\":\"123456\",\"role\":\"employee\",\"position\":\"Engineer\",\"dateOfBirth\":\"$TOMORROW\"}")
assert_status "$RES" "201" "Register Employee (DOB=$TOMORROW)"
EMP_TOKEN=$(grep -oE '"token":"[^"]+"' /tmp/r.json | sed 's/"token":"//;s/"$//')

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$HR_EMAIL\",\"password\":\"123456\"}")
assert_status "$RES" "200" "Login HR"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$HR_EMAIL\",\"password\":\"wrongpass\"}")
assert_status "$RES" "401" "Login with wrong password rejected"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"X\",\"email\":\"short.$TS@test.com\",\"password\":\"abc\",\"role\":\"employee\"}")
assert_status "$RES" "400" "Short password rejected"

echo ""
echo "[2] ASSETS (HR)"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/assets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HR_TOKEN" \
  -d "{\"productName\":\"MacBook E2E\",\"productType\":\"returnable\",\"productQuantity\":3}")
assert_status "$RES" "201" "Create returnable asset"
ASSET_R=$(grep -oE '"_id":"[a-f0-9]+"' /tmp/r.json | head -1 | sed 's/"_id":"//;s/"$//')

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/assets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HR_TOKEN" \
  -d "{\"productName\":\"Notebook E2E\",\"productType\":\"non-returnable\",\"productQuantity\":10}")
assert_status "$RES" "201" "Create non-returnable asset"
ASSET_N=$(grep -oE '"_id":"[a-f0-9]+"' /tmp/r.json | head -1 | sed 's/"_id":"//;s/"$//')

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/assets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d "{\"productName\":\"Forbidden\",\"productType\":\"returnable\",\"productQuantity\":1}")
assert_status "$RES" "403" "Employee cannot create asset"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X PATCH "$BASE/api/assets/$ASSET_R" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HR_TOKEN" \
  -d "{\"productQuantity\":5}")
assert_status "$RES" "200" "Edit asset qty 3 to 5"
AVAIL=$(grep -oE '"availableQuantity":[0-9]+' /tmp/r.json | head -1 | sed 's/"availableQuantity"://')
if [ "$AVAIL" = "5" ]; then
  echo "  PASS  availableQuantity recalculated to 5"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL  availableQuantity expected 5 got $AVAIL"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FAILURES="$FAILURES\n  - Asset edit delta: expected 5 got $AVAIL"
fi

echo ""
echo "[3] REQUESTS"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d "{\"assetId\":\"$ASSET_R\",\"note\":\"Need for work\"}")
assert_status "$RES" "201" "Employee creates request (returnable)"
REQ_R=$(grep -oE '"_id":"[a-f0-9]+"' /tmp/r.json | head -1 | sed 's/"_id":"//;s/"$//')

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d "{\"assetId\":\"$ASSET_R\"}")
assert_status "$RES" "409" "Duplicate pending request blocked"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d "{\"assetId\":\"$ASSET_N\"}")
assert_status "$RES" "201" "Request non-returnable asset"

echo ""
echo "[4] APPROVAL & AFFILIATION"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X PATCH "$BASE/api/requests/$REQ_R" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HR_TOKEN" \
  -d "{\"action\":\"approve\"}")
assert_status "$RES" "200" "HR approves request"

sleep 1
EMP_LIST=$(curl -s -H "Authorization: Bearer $HR_TOKEN" "$BASE/api/employees")
AFF=$(echo "$EMP_LIST" | grep -oE '"total":[0-9]+' | sed 's/"total"://')
if [ "$AFF" = "1" ]; then
  echo "  PASS  Affiliation auto-created (1 employee)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL  Expected 1 affiliated employee got $AFF"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FAILURES="$FAILURES\n  - Affiliation: expected 1 got $AFF"
fi

ASSET_LIST=$(curl -s -H "Authorization: Bearer $HR_TOKEN" "$BASE/api/assets")
QTY=$(echo "$ASSET_LIST" | grep -oE '"productName":"MacBook E2E"[^}]*"availableQuantity":[0-9]+' | grep -oE '"availableQuantity":[0-9]+' | sed 's/"availableQuantity"://')
if [ "$QTY" = "4" ]; then
  echo "  PASS  Stock decreased after approval (5 to 4)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL  Expected 4 after approval got $QTY"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FAILURES="$FAILURES\n  - Stock decrement: expected 4 got $QTY"
fi

echo ""
echo "[5] RETURN & STOCK RESTORE"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X PATCH "$BASE/api/requests/$REQ_R" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d "{\"action\":\"return\"}")
assert_status "$RES" "200" "Employee returns asset"

ASSET_LIST=$(curl -s -H "Authorization: Bearer $HR_TOKEN" "$BASE/api/assets")
QTY=$(echo "$ASSET_LIST" | grep -oE '"productName":"MacBook E2E"[^}]*"availableQuantity":[0-9]+' | grep -oE '"availableQuantity":[0-9]+' | sed 's/"availableQuantity"://')
if [ "$QTY" = "5" ]; then
  echo "  PASS  Stock restored after return (4 to 5)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL  Expected 5 after return got $QTY"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FAILURES="$FAILURES\n  - Stock restore: expected 5 got $QTY"
fi

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X PATCH "$BASE/api/requests/$REQ_R" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d "{\"action\":\"return\"}")
assert_status "$RES" "400" "Cannot return already-returned asset"

echo ""
echo "[6] TEAM & BIRTHDAY"

TEAM_RES=$(curl -s -H "Authorization: Bearer $EMP_TOKEN" "$BASE/api/team")
TEAM_COUNT=$(echo "$TEAM_RES" | grep -oE '"team":\[[^]]*\]' | grep -oE '"_id"' | wc -l)
if [ "$TEAM_COUNT" -ge "1" ]; then
  echo "  PASS  Employee sees team ($TEAM_COUNT members)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL  Employee should see team but got 0"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

BDAY=$(echo "$TEAM_RES" | grep -oE '"upcomingBirthdays":\[[^]]*\]' | grep -oE '"_id"' | wc -l)
echo "  INFO  Upcoming birthdays detected: $BDAY"

echo ""
echo "[7] ANALYTICS"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -H "Authorization: Bearer $HR_TOKEN" "$BASE/api/analytics")
assert_status "$RES" "200" "Analytics endpoint"

echo ""
echo "[8] SECURITY"

RES=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/assets")
assert_status "$RES" "401" "API rejects no token"

RES=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer faketoken123" "$BASE/api/assets")
assert_status "$RES" "401" "API rejects invalid token"

RES=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $EMP_TOKEN" "$BASE/api/employees")
assert_status "$RES" "403" "Employee blocked from /api/employees"

echo ""
echo "[9] EMPLOYEE REMOVAL"

ENC_EMAIL=$(python -c "import urllib.parse; print(urllib.parse.quote('$EMP_EMAIL'))")
RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X DELETE "$BASE/api/employees/$ENC_EMAIL" \
  -H "Authorization: Bearer $HR_TOKEN")
assert_status "$RES" "200" "HR removes employee"

EMP_LIST=$(curl -s -H "Authorization: Bearer $HR_TOKEN" "$BASE/api/employees")
AFF=$(echo "$EMP_LIST" | grep -oE '"total":[0-9]+' | sed 's/"total"://')
if [ "$AFF" = "0" ]; then
  echo "  PASS  Affiliation removed (0 employees)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "  FAIL  Expected 0 affiliations got $AFF"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

echo ""
echo "[10] STRIPE CHECKOUT"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/payment/create-checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HR_TOKEN" \
  -d "{\"packageName\":\"standard\"}")
assert_status "$RES" "200" "Stripe checkout session created"

RES=$(curl -s -o /tmp/r.json -w "%{http_code}" -X POST "$BASE/api/payment/create-checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HR_TOKEN" \
  -d "{\"packageName\":\"basic\"}")
assert_status "$RES" "400" "Basic plan downgrade blocked"

echo ""
echo "================================="
echo "  RESULT: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "================================="
if [ "$FAIL_COUNT" -gt "0" ]; then
  echo ""
  printf "FAILURES:%b\n" "$FAILURES"
fi
