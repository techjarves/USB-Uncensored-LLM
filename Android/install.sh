#!/data/data/com.termux/files/usr/bin/bash
# ================================================================
#  PORTABLE UNCENSORED AI - Android Native Installer (Llama.cpp)
# ================================================================
#  Natively compiles Llama.cpp on your device for max performance
#  and sets up the universal USB folder architecture.
# ================================================================

# ---- Detect Termux ----
if [ -z "$TERMUX_VERSION" ] && [ ! -d "/data/data/com.termux" ]; then
    echo "ERROR: This script must run inside Termux!"
    echo "Install Termux from F-Droid: https://f-droid.org/en/packages/com.termux/"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
USB_ROOT="$(dirname "$SCRIPT_DIR")"
SHARED_DIR="$USB_ROOT/Shared"
SHARED_BIN="$SHARED_DIR/bin"
MODELS_DIR="$SHARED_DIR/models"

mkdir -p "$SHARED_BIN" "$MODELS_DIR"

RED='\033[0;31m'
YLW='\033[1;33m'
GRN='\033[0;32m'
CYN='\033[0;36m'
MAG='\033[0;35m'
GRY='\033[0;37m'
DGR='\033[1;30m'
WHT='\033[1;37m'
RST='\033[0m'

echo ""
echo -e "${CYN}==========================================================${RST}"
echo -e "${CYN}   PORTABLE AI - Android Native Setup (Llama.cpp)         ${RST}"
echo -e "${CYN}==========================================================${RST}"

# ================================================================
# 1. System & Dependencies
# ================================================================
echo -e "${YLW}[1/4] Preparing Termux environment...${RST}"

# Grant storage permission
if [ ! -d "$HOME/storage" ]; then
    echo -e "${DGR}      Requesting storage permission...${RST}"
    termux-setup-storage 2>/dev/null || true
    sleep 2
fi

echo -e "${DGR}      Updating packages and installing build tools...${RST}"
# Use apt instead of pkg to avoid caching bugs, full-upgrade ensures SSL libs are fixed
apt update -y
apt full-upgrade -y
pkg install -y clang cmake git wget ninja python

echo -e "${GRN}      Dependencies installed!${RST}"

TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}')
TOTAL_RAM_GB=$(awk "BEGIN{printf \"%.1f\", $TOTAL_RAM_KB/1048576}")
echo -e "${DGR}      Device RAM: ${TOTAL_RAM_GB} GB${RST}"

# ================================================================
# 2. Compile Llama.cpp natively
# ================================================================
echo ""
echo -e "${YLW}[2/4] Preparing Llama.cpp Engine...${RST}"
cd "$SHARED_BIN"

if [ ! -d "llama.cpp" ]; then
    echo -e "${DGR}      Cloning llama.cpp source...${RST}"
    git clone https://github.com/ggerganov/llama.cpp.git
fi

cd llama.cpp
if [ ! -f "build/bin/llama-server" ]; then
    echo -e "${MAG}      Compiling engine natively for your processor...${RST}"
    echo -e "${MAG}      (This takes 10 to 30 minutes! Do not close Termux)${RST}"
    
    # Acquire wakelock so Android doesn't kill compilation
    termux-wake-lock 2>/dev/null || true
    
    rm -rf build 2>/dev/null
    cmake -B build -GNinja -DLLAMA_BUILD_SERVER=ON -DLLAMA_BUILD_TESTS=OFF
    cmake --build build --config Release --target llama-server
    
    termux-wake-unlock 2>/dev/null || true
    echo -e "${GRN}      Compilation complete!${RST}"
else
    echo -e "${GRN}      Engine already compiled! Skipping...${RST}"
fi

cp build/bin/llama-server "$SHARED_BIN/llama-server-android" 2>/dev/null || true

# ================================================================
# 3. Model Retrieval
# ================================================================
echo ""
echo -e "${YLW}[3/4] AI Model Library...${RST}"

echo -e "  ${YLW}[1]${RST} Gemma 2 2B Abliterated   (1.6 GB) ${RED}[UNCENSORED - FASTEST]${RST}"
echo -e "  ${YLW}[2]${RST} SmolLM2 1.7B Uncensored  (1.0 GB) ${RED}[UNCENSORED - LIGHT]${RST}"
echo -e "  ${YLW}[3]${RST} Qwen2.5 1.5B Instruct    (1.1 GB) ${CYN}[STANDARD - MULTILINGUAL]${RST}"
echo -e "  ${YLW}[4]${RST} Phi 3.5 Mini 3.8B        (2.2 GB) ${CYN}[STANDARD - SMART]${RST}"
echo -e "  ${YLW}[5]${RST} Qwen 3.5 9B Uncensored   (5.2 GB) ${MAG}[HEAVY - FOR 12GB+ RAM]${RST}"
echo -e "  ${GRN}[C]${RST} CUSTOM - Paste HuggingFace .gguf direct link"
echo -e "  ${DGR}[0]${RST} Skip downloading (I already have models in Shared/models/)"
echo ""
read -r -p "  Select model (0-5 or C): " MODEL_CHOICE

MODEL_URL=""
case $(echo "$MODEL_CHOICE" | tr '[:upper:]' '[:lower:]') in
    1)
        MODEL_URL="https://huggingface.co/bartowski/gemma-2-2b-it-abliterated-GGUF/resolve/main/gemma-2-2b-it-abliterated-Q4_K_M.gguf"
        MODEL_FILE="gemma-2-2b-it-abliterated-Q4_K_M.gguf"
        ;;
    2)
        MODEL_URL="https://huggingface.co/bartowski/SmolLM2-1.7B-Instruct-Uncensored-GGUF/resolve/main/SmolLM2-1.7B-Instruct-Uncensored-Q4_K_M.gguf"
        MODEL_FILE="SmolLM2-1.7B-Instruct-Uncensored-Q4_K_M.gguf"
        ;;
    3)
        MODEL_URL="https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf"
        MODEL_FILE="Qwen2.5-1.5B-Instruct-Q4_K_M.gguf"
        ;;
    4)
        MODEL_URL="https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf"
        MODEL_FILE="Phi-3.5-mini-instruct-Q4_K_M.gguf"
        ;;
    5)
        MODEL_URL="https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive/resolve/main/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf"
        MODEL_FILE="Qwen3.5-9B-Uncensored-Q4.gguf"
        ;;
    c|custom)
        read -r -p "  Paste direct .gguf URL: " CUSTOM_URL
        if [ -n "$CUSTOM_URL" ]; then
            MODEL_URL="$CUSTOM_URL"
            MODEL_FILE=$(basename "${MODEL_URL%%\?*}")
            [[ "$MODEL_FILE" != *.gguf ]] && MODEL_FILE="${MODEL_FILE}.gguf"
        fi
        ;;
    0|skip)
        echo -e "${GRN}      Skipping download phase.${RST}"
        ;;
    *)
        echo -e "${YLW}      Invalid choice. Defaulting to Gemma 2 2B.${RST}"
        MODEL_URL="https://huggingface.co/bartowski/gemma-2-2b-it-abliterated-GGUF/resolve/main/gemma-2-2b-it-abliterated-Q4_K_M.gguf"
        MODEL_FILE="gemma-2-2b-it-abliterated-Q4_K_M.gguf"
        ;;
esac

cd "$MODELS_DIR" || exit 1

if [ -n "$MODEL_URL" ]; then
    if [ -f "$MODEL_FILE" ]; then
        echo -e "${GRN}      $MODEL_FILE already downloaded!${RST}"
    else
        echo -e "${MAG}      Downloading $MODEL_FILE...${RST}"
        termux-wake-lock 2>/dev/null || true
        # Use wget -c to allow resuming broken downloads
        wget -c "$MODEL_URL" -O "$MODEL_FILE"
        termux-wake-unlock 2>/dev/null || true
        echo -e "${GRN}      Download complete!${RST}"
    fi
fi

# ================================================================
# 4. Final Summary
# ================================================================
echo ""
echo -e "${CYN}==========================================================${RST}"
echo -e "${GRN}   ANDROID SETUP COMPLETE!${RST}"
echo -e "${CYN}==========================================================${RST}"
echo ""
echo -e "  Your engine has been natively compiled for your exact processor."
echo -e "  Models are universally stored in ${WHT}Shared/models/${RST}"
echo ""
echo -e "  ${GRY}To start the AI, run:${RST}"
echo -e "  ${WHT}bash Android/start.sh${RST}"
echo ""
read -n 1 -s -r -p "Press any key to close this installer..."
echo ""
