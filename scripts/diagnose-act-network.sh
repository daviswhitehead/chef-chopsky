#!/bin/bash
# Diagnose network issues in Act's Docker environment

echo "🔍 Act Network Diagnostics"
echo "========================="
echo ""

echo "📋 Container Information:"
echo "Hostname: $(hostname)"
echo "Hostname -I: $(hostname -I || echo 'N/A')"
echo ""

echo "📋 Network Interfaces:"
ip addr show 2>/dev/null || ifconfig

echo ""
echo "📋 Routing Table:"
ip route 2>/dev/null || netstat -rn

echo ""
echo "📋 DNS Configuration:"
cat /etc/resolv.conf 2>/dev/null || echo "N/A"

echo ""
echo "📋 Localhost Resolution:"
getent hosts localhost || echo "N/A"

echo ""
echo "📋 Active Connections:"
netstat -tuln 2>/dev/null || ss -tuln

echo ""
echo "📋 Test Localhost Connectivity:"
for port in 3000 3001 54321; do
  echo -n "Port $port: "
  nc -zv localhost $port 2>&1 || echo "Not accessible"
done

echo ""
echo "✅ Diagnostics complete"
