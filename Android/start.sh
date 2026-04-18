#!/data/data/com.termux/files/usr/bin/bash
# ===================================================
#  Portable AI - Android (Llama.cpp Engine)
# ===================================================

echo "==================================================="
echo "    Portable AI - Android Native Launcher"
echo "==================================================="
echo ""
echo "  Launches the natively compiled AI engine"
echo "  and beautifully serves the USB FastChatUI."
echo ""

# ---- Detect Termux ----
if [ -z "$TERMUX_VERSION" ] && [ ! -d "/data/data/com.termux" ]; then
    echo "ERROR: This script must run inside Termux!"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
USB_ROOT="$(dirname "$SCRIPT_DIR")"
SHARED_DIR="$USB_ROOT/Shared"
SHARED_BIN="$SHARED_DIR/bin"
MODELS_DIR="$SHARED_DIR/models"

if [ ! -f "$SHARED_BIN/llama-server-android" ]; then
    echo "==================================================="
    echo "  ERROR: Android Native Engine Not Found!"
    echo "==================================================="
    echo "  Please run 'bash Android/install.sh' first"
    echo "  so the engine can compile for your processor."
    exit 1
fi

# Find the first .gguf file to load automatically
MODEL_FILE=$(ls "$MODELS_DIR"/*.gguf 2>/dev/null | head -n 1)

if [ -z "$MODEL_FILE" ]; then
    echo "ERROR: No .gguf models found in Shared/models/!"
    echo "Please download a model using install.sh first."
    exit 1
fi

echo "  Auto-selected model: $(basename "$MODEL_FILE")"
echo ""

# Acquire wakelock to prevent Android from killing the process
echo "Acquiring Termux wakelock (prevents sleep)..."
termux-wake-lock 2>/dev/null || true

# Check if Llama.cpp is already running
if curl -s http://127.0.0.1:8080/v1/models > /dev/null 2>&1; then
    echo "[OK] Llama engine is already running!"
else
    echo "Starting offline Android AI Engine (Llama-Server)..."
    
    # Run llama-server natively. -c 2048 limits context to fit in mobile RAM
    "$SHARED_BIN/llama-server-android" -m "$MODEL_FILE" -c 2048 -cb -np 4 --port 8080 > "$SHARED_DIR/llama-server.log" 2>&1 &
    LLAMA_PID=$!
    
    echo "Loading AI into memory (can take up to 20 seconds)..."
    WAIT_COUNT=0
    until curl -s http://127.0.0.1:8080/v1/models > /dev/null 2>&1; do
        sleep 1
        WAIT_COUNT=$((WAIT_COUNT + 1))
        if [ "$WAIT_COUNT" -ge 90 ]; then
            echo ""
            echo "ERROR: Engine failed to start after 90s!"
            echo "Device RAM might be too low, or Model is too large."
            echo "Check: cat $SHARED_DIR/llama-server.log"
            kill -9 $LLAMA_PID 2>/dev/null
            termux-wake-unlock 2>/dev/null || true
            exit 1
        fi
    done
    echo "[OK] Engine is online!"
fi

# ---- Detect local IP for LAN access ----
LOCAL_IP="127.0.0.1"
if command -v ip &> /dev/null; then
    LOCAL_IP=$(ip route get 1 2>/dev/null | awk '{for(i=1;i<=NF;i++)if($i=="src"){print $(i+1);exit}}')
elif command -v ifconfig &> /dev/null; then
    LOCAL_IP=$(ifconfig wlan0 2>/dev/null | grep 'inet ' | awk '{print $2}' | sed 's/addr://')
fi
[ -z "$LOCAL_IP" ] && LOCAL_IP="127.0.0.1"

echo ""
echo -e "\033[0;36m===================================================\033[0m"
echo -e "\033[0;32m  AI ENGINE IS FULLY ONLINE!\033[0m"
echo -e "\033[0;36m===================================================\033[0m"
echo ""
echo "  Which interface would you like to open?"
echo ""
echo -e "  \033[1;33m[1]\033[0m USB FastChat UI (Beautiful Dark Mode, Auto-Saves)"
echo -e "  \033[1;33m[2]\033[0m Llama.cpp Default UI (Classic Raw Developer UI)"
echo ""
read -r -p "  Enter your choice (1 or 2): " UI_CHOICE

if [ "$UI_CHOICE" = "2" ]; then
    echo "  Opening Llama Default UI..."
    TARGET_URL="http://localhost:8080"
else
    echo "  Opening USB FastChat UI..."
    TARGET_URL="http://localhost:3333"
fi

# Open selected UI automatically
am start -a android.intent.action.VIEW -d "$TARGET_URL" 2>/dev/null || \
    termux-open-url "$TARGET_URL" 2>/dev/null || \
    echo -e "  \033[0;31mCould not auto-open browser.\033[0m Please go to: $TARGET_URL"

echo ""
echo -e "\033[0;37m  Starting background server... Press Ctrl+C to shut down the AI.\033[0m"

# Start the python proxy server so FastChatUI works and saves history
if command -v python3 &> /dev/null; then
    python3 "$SHARED_DIR/chat_server.py" --no-browser --llama-cpp
elif command -v python &> /dev/null; then
    python "$SHARED_DIR/chat_server.py" --no-browser --llama-cpp
else
    echo "ERROR: Python not found! Install with: apt install python -y"
    # Cleanup
    if [ -n "$LLAMA_PID" ]; then
        kill -9 $LLAMA_PID 2>/dev/null
    fi
    termux-wake-unlock 2>/dev/null || true
    exit 1
fi

# Cleanup on exit
if [ -n "$LLAMA_PID" ]; then
    kill -9 $LLAMA_PID 2>/dev/null
fi
termux-wake-unlock 2>/dev/null || true
echo "Goodbye!"
