> [!IMPORTANT]
> **This repository (`USB-Uncensored-LLM `) is deprecated and is no longer actively maintained.**
> 
> All active development, features, and bug fixes (including the Windows crash/access violation fixes) have moved to:
> ### 👉 **[Uncensored-Local-Studio](https://github.com/techjarves/Uncensored-Local-Studio)**
> 
> Please visit the new repository to download the latest version, report issues, and follow the project's development.


# USB-Uncensored-LLM ⚡

**Version:** 2.0.0 | **Last Updated:** 2026-06-16

**USB-Uncensored-LLM** is a fully air-gapped, zero-dependency, plug-and-play Local AI environment designed to run seamlessly from your **local hard drive** or a **portable USB/SSD**. It bypasses complex installations natively executing large language models directly on your hardware with no internet required.

With a unified architecture, you can initialize your AI models once and choose to keep them on your system or carry them with you across Windows, macOS, and Linux PCs.

🎥 **Watch the Setup & Demo Video:** [https://youtu.be/60PSXsoXc8A](https://youtu.be/60PSXsoXc8A)

[![USB-Uncensored-LLM Setup & Demo](https://img.youtube.com/vi/60PSXsoXc8A/maxresdefault.jpg)](https://youtu.be/60PSXsoXc8A)

## 🚀 Core Features
* **Zero Dependency Setup:** Ships with portable Python and isolated engine binaries. No system permissions, registry edits, or package managers required.
* **Cross-Platform Interoperability:** Uses a intelligent `Shared` volume system — download your 5GB+ AI models *once*, and use them natively on Windows, macOS, and Linux without duplication.
* **Censorship Free:** Integrates cutting-edge ablative and heretic fine-tuned models for completely unfiltered interactions.
* **Network Proxied UI:** The custom Python HTTP server instantly serves a blazing-fast dark mode UI. You can access the AI from your phone or tablet on the same WiFi network.
* **Hardware Accelerated:** Uses a custom-compiled Ollama engine under the hood, natively capitalizing on AVX CPU instructions, NVIDIA CUDA, or Apple Metal GPU accelerators dynamically when plugged into different host machines.
* **Security Hardened:** Built-in auth token, CORS restriction, rate limiting, XSS protection via DOMPurify, and SHA256 download verification.

---

## 💻 System Requirements
Before preparing your drive, ensure you have:
- **Storage:** A USB 3.0+ flash drive or SSD with an absolute minimum of **8 GB** free space (16 GB is **highly** recommended).
- **RAM:** The host computer should have at least **8 GB of system memory** to run the 2B/4B models, and **16 GB of memory** to fluidly run the 9B/12B models.

---

## 📂 Folder Architecture

The project is structured to strictly isolate operating system executables while securely unifying heavy model weights to save precious portable storage capacity.

```text
[Portable USB Drive]
 ├── 📁 Android    # Native Android (Termux) installers & launchers
 ├── 📁 Linux      # Native Ubuntu/Debian offline installers & launchers
 ├── 📁 Mac        # Native macOS offline installers & launchers
 ├── 📁 Windows    # Native Windows offline automatic UI menus
 └── 📁 Shared     # Unified Data System
      ├── 📁 archive     (Deprecated/legacy files, kept for reference)
      ├── 📁 bin         (Holds isolated executables: ollama-windows.exe, ollama-darwin...)
      ├── 📁 chat_data   (Houses cross-platform persistent conversation history)
      ├── 📁 config      (Centralized configuration: models.json, settings.json, version info)
      ├── 📁 lib         (Linux/macOS extracted runtimes: llama-server, etc.)
      ├── 📁 logs        (Server logs with rotating file handler)
      ├── 📁 models      (HuggingFace GGUF Weights & local database mapping)
      ├── 📁 python      (Isolated portable python environment)
      ├── 📁 scripts     (Shared utility scripts: config_query.py, migration, download-ui-assets)
      ├── 📁 ui          (Modular web interface: HTML, CSS, JS modules)
      │    ├── 📁 css    (styles.css — design tokens, layout, responsive)
      │    ├── 📁 js     (6 modular files: core, api, markdown, chat, ui, app)
      │    └── index.html (Entry point — loads vendor assets + modules)
      └── 📁 vendor      (Offline UI assets: Marked.js, DOMPurify, highlight.js, Font Awesome, fonts)
```

---

## 🧠 Curated AI Model Library

This USB ships with a curated installer for the highest-quality, locally operable uncensored models available on the open-source market today:

1. **Gemma 2 2B Abliterated (~1.6 GB)** — [UNCENSORED] *Recommended for all.* Extremely fast, incredibly smart for its size, with safety alignment vectors mathematically purged.
2. **Gemma 4 E4B Ultra Uncensored Heretic (~5.34 GB)** — [UNCENSORED] A "heretic" fine-tune that aggressively forces compliance to all user queries.
3. **Qwen 3.5 9B Uncensored Aggressive (~5.2 GB)** — [UNCENSORED] A larger, competent reasoning model with strict adherence to raw, unbiased answers.
4. **NemoMix Unleashed 12B (~7.0 GB)** — [UNCENSORED] Heavyweight merge for maximum reasoning capability on high-RAM systems.
5. **Dolphin 2.9 Llama 3 8B (~4.9 GB)** — [UNCENSORED] General-purpose uncensored model, strong across all domains.
6. **Phi-3.5 Mini 3.8B (~2.2 GB)** — [STANDARD] Lightweight but capable model for lower-end hardware.
7. **Custom Models**: The installer supports downloading *any* .gguf weight directly from HuggingFace into the USB's engine.

Model catalog is defined in `Shared/config/models.json` — easy to add or modify entries without editing scripts.

---

## ⚙️ Quick Start Guide

### Step 1: Initialize the Engine
Depending on the computer you are currently plugged into, navigate into the respective Operating System folder and double-click/run the install script. 
* **Windows:** Double-click `Windows/install.bat`
* **macOS:** Open Terminal, drag in `Mac/install.command`, and press Enter.
* **Linux:** Run `bash Linux/install.sh`
* **Android:** Open Termux, run `bash Android/install.sh` (see Android section below)

> **Note:** Initializing simply downloads the tiny 50MB execution engine specific to that computer to the `Shared/bin` folder. 

### Step 2: Download AI Models 
It is highly recommended to run the model download phase via a **Windows PC** (`Windows/install.bat`), which provides an interactive, terminal-based catalog to easily select and download highly curated, uncensored GGUF Models. 
*(If you do not have a Windows PC, simply download your `.gguf` weights from HuggingFace and place them into the `Shared/models` folder manually).*

### Step 3: Launch
Open the respective OS folder and run the `start` script:
* **Windows:** `Windows/start-fast-chat.bat`
* **macOS:** `Mac/start.command`
* **Linux:** `bash Linux/start.sh`
* **Android:** `bash Android/start.sh` (in Termux)

The engine will spin up securely in the background, and your default web browser will automatically open the locally-served Chat UI.

---

## 🏠 Local Disk Installation
While this project is optimized for USB portability, it works beautifully as a lightweight local AI setup on your primary computer.

**How to Install Locally:**
1.  **Download/Clone** this repository to a folder on your `C:\` or `D:\` drive.
2.  Navigate to the **Windows** (or Mac/Linux) folder.
3.  Run **`install.bat`** and choose your desired models.
4.  The system will download everything into that local folder. 
5.  Run **`start-fast-chat.bat`** to begin.

*Benefit:* Running from an internal SSD is significantly faster than a USB drive, resulting in near-instant AI model loading!

---

## 📱 Android Native (Termux)
Run the AI engine **directly on your Android phone or tablet** — no PC required!

### Requirements
- **Termux** installed from [F-Droid](https://f-droid.org/en/packages/com.termux/) (NOT the Play Store — it's outdated)
- **6 GB+ RAM** (8 GB+ recommended). Only the 2B model runs well on 6 GB devices.
- **WiFi or mobile data** for initial setup (downloading engine + models)
- **ARM64 processor** (virtually all modern Android phones/tablets)

### Setup
1. Copy the USB-Uncensored-LLM folder to your Android device (via USB OTG, file transfer, or `git clone`)
2. Open **Termux** and navigate to the project folder
3. Run: `bash Android/install.sh`
4. Select your model (Gemma 2 2B recommended for most Android devices)
5. Wait for downloads to complete — **keep Termux in the foreground!**

### Launch
```bash
bash Android/start.sh
```
The AI engine starts and Chrome opens automatically with the chat UI.

### Android Performance Tips
- **Run `termux-wake-lock`** before starting — prevents Android from killing the process
- **Keep Termux in the foreground** for best performance
- **Close other apps** to free RAM for the AI model
- **Use the 2B model** on devices with less than 12 GB RAM
- **Plug in your charger** — LLM inference drains battery fast
- Expect **~3-10 tokens/sec** on the 2B model (vs 30-50+ on a PC with GPU)

---

## 📱 LAN Mobile Access
If you want to use the Heavyweight AI from your phone while lounging on the couch:
1. Ensure your PC running the `start` script and your phone are on the exact same WiFi network.
2. The terminal window will automatically detect your host machine and display a **Network Access** IP Address (e.g., `http://192.168.1.15:3333`).
3. Type that URL into your mobile browser (Safari/Chrome). The custom Python server routes mobile queries directly to the USB! *(Note: If pages do not load, ensure Windows Firewall allows incoming connections on port `3333`)*.
4. If auth is enabled, the browser will prompt for the token shown in the terminal at startup.

---

## 🔒 Security Considerations

USB-Uncensored-LLM is designed for local/network use in trusted environments. The following security measures are in place:

### Auth Token
The server generates a random Bearer token on first run (stored in `Shared/chat_data/.auth_token`). All API requests must include `Authorization: Bearer <token>`. The token is displayed on server startup.

### CORS Restriction
By default, only `localhost:3333`, `127.0.0.1:3333`, and the auto-detected LAN IP are allowed as origins. Wildcard (`*`) is not used.

### Rate Limiting
Per-IP token bucket limits requests to 60 per minute. Excess requests receive HTTP 429.

### XSS Protection
User and model content is rendered through DOMPurify before DOM injection, preventing cross-site scripting attacks via model responses.

### Download Integrity
SHA256 checksum verification is built into all install scripts. Hashes are verified for Ollama engine downloads. Model hashes are checked when available.

### Input Validation
- Request body limited to 10 MB
- Settings endpoint accepts only known keys (`globalSystemPrompt`, `temperature`, `logMode`)
- Chat data must be a valid JSON array

### Network Exposure
- Server binds to `0.0.0.0` (all interfaces) by default for LAN access
- When accessing over LAN, include the auth token in your client if authentication is enabled
- For single-machine use, consider binding to `127.0.0.1` only

## 📋 Changelog

### 2026-06-16 — v2.0.1
- **LLM Select UI**: Model dropdown now shows a clear "No models available" state when Ollama is unreachable or has no models loaded. Button visually indicates the error state with orange styling.
- **401 Error Display**: Unauthorized responses from both the chat server and Ollama now show descriptive error messages with hints on how to resolve (check server console / check Ollama auth).
- **Image Support Guard**: Images can no longer be attached or sent to models that don't support vision input. Both the attachment action and send action are blocked with a clear error message: `Cannot read "image.png" (this model does not support image input)`.

---

## 🛠️ Troubleshooting

- **The script instantly closes on Windows:** You likely have the legacy Windows App Execution Aliases turned on, which tricks the OS. Run the script via a command prompt, or right-click the `.bat` file and "Run as Administrator".
- **"Ollama Engine Not Found":** You attempted to run the `start` script before the `install` script downloaded the base software for your specific OS. Run your OS's installer!
- **Slow Generation Speeds:** Your model is too large for your host PC's RAM. Re-run `install.bat` and select the **Gemma 2 2B Abliterated** model, which runs rapidly even on older machines.
- **"401 Unauthorized" in browser:** The server requires an auth token. Restart the server and copy the token shown in the terminal. For local browser access, the token is not needed.

---
> *Disclaimer: USB-Uncensored-LLM is built for uncompromising computational freedom. By utilizing ablative models, the system will not moralize, lecture, or refuse your prompts. Please use responsibly.*
