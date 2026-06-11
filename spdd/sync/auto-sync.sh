#!/bin/bash
echo "🔄 ViralSpy SPDD Sync Check"
echo "================================"
echo "Run in Antigravity:"
echo "/spdd-sync @spdd/prompt/viralspy-reasons-canvas.md"
echo ""
echo "Pending operations:"
grep -n "\[ \]" spdd/sync/viralspy-sync.md
echo "================================"
