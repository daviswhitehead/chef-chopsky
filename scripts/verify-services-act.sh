#!/bin/bash
# Verify services are running correctly in Act environment

echo "🔍 Service Verification Script"
echo "=============================="
echo ""

# Check frontend
echo "Checking Frontend (http://localhost:3000)..."
if curl -s -f http://localhost:3000/ > /dev/null 2>&1; then
  echo "✅ Frontend is responding"
else
  echo "❌ Frontend is NOT responding"
  FRONTEND_STATUS="FAIL"
fi

# Check agent
echo ""
echo "Checking Agent (http://localhost:3001/health)..."
if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
  echo "✅ Agent is responding"
  curl -s http://localhost:3001/health | head -20
else
  echo "❌ Agent is NOT responding"
  AGENT_STATUS="FAIL"
fi

# Check Supabase
echo ""
echo "Checking Supabase..."
cd frontend
if supabase status > /dev/null 2>&1; then
  echo "✅ Supabase is running"
  supabase status
else
  echo "❌ Supabase is NOT running"
  SUPABASE_STATUS="FAIL"
fi
cd ..

# Check processes
echo ""
echo "🔍 Running Processes:"
ps aux | grep -E "(next|tsx|node|supabase)" | grep -v grep || echo "No relevant processes found"

# Check ports
echo ""
echo "🔍 Port Status:"
netstat -tuln | grep -E ':(3000|3001|54321)' || echo "Ports 3000, 3001, 54321 not bound"

# Summary
echo ""
echo "📊 Summary:"
[ "$FRONTEND_STATUS" = "FAIL" ] && echo "❌ Frontend failed" || echo "✅ Frontend OK"
[ "$AGENT_STATUS" = "FAIL" ] && echo "❌ Agent failed" || echo "✅ Agent OK"
[ "$SUPABASE_STATUS" = "FAIL" ] && echo "❌ Supabase failed" || echo "✅ Supabase OK"

if [ "$FRONTEND_STATUS" = "FAIL" ] || [ "$AGENT_STATUS" = "FAIL" ] || [ "$SUPABASE_STATUS" = "FAIL" ]; then
  exit 1
fi

echo ""
echo "✅ All services verified successfully!"
