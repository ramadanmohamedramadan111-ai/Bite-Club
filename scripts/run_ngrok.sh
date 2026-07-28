#!/bin/bash
# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Kill any existing ngrok processes first to avoid conflicts
pkill -f "ngrok http" || true
sleep 1

# Start ngrok with the policy file and log output
nohup ngrok http 8080 --traffic-policy-file="$SCRIPT_DIR/ngrok_policy.yml" --log=stdout > "$SCRIPT_DIR/ngrok.log" 2>&1 &
disown

# Wait for ngrok to start and print the URL
echo "Starting ngrok tunnel..."
for i in {1..10}; do
  sleep 1
  URL=$(grep -o 'url=https://[a-zA-Z0-9.-]*' "$SCRIPT_DIR/ngrok.log" | cut -d'=' -f2)
  if [ ! -z "$URL" ]; then
    echo "=================================================="
    echo " 🎉 Ngrok Tunnel Started Successfully!"
    echo " 🔗 Public Backend URL: $URL"
    echo "=================================================="
    exit 0
  fi
done

echo "❌ FAILED to retrieve ngrok URL. Here are the last few lines of the log:"
tail -n 15 "$SCRIPT_DIR/ngrok.log"
exit 1
