#!/bin/bash
echo "🚀 Starting all services..."
docker compose up -d
echo ""
echo "🌍 Services running at:"
echo "   http://api.localhost"
echo "   http://dashboard.localhost"
echo "   http://web.localhost"
echo "   http://ai.localhost"
