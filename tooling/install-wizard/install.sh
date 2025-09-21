#!/bin/bash

# Local-Fill Extension Installation Wizard
# One-command setup for the privacy-first job application autofill extension

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXTENSION_NAME="Local-Fill"
REPO_URL="https://github.com/yourusername/local-fill"
LATEST_RELEASE_URL="${REPO_URL}/releases/latest/download/extension.zip"
INSTALL_DIR="$HOME/.local-fill"
CHROME_EXTENSIONS_DIR=""

# Check if running in dry-run mode
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${BLUE}Running in dry-run mode${NC}"
fi

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect operating system
detect_os() {
    case "$(uname -s)" in
        Darwin*)
            echo "macos"
            ;;
        Linux*)
            echo "linux"
            ;;
        CYGWIN*|MINGW32*|MSYS*|MINGW*)
            echo "windows"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Detect browser and get extensions directory
detect_browser() {
    local os="$1"
    local browser=""
    
    case "$os" in
        "macos")
            if [[ -d "/Applications/Google Chrome.app" ]]; then
                browser="chrome"
                CHROME_EXTENSIONS_DIR="$HOME/Library/Application Support/Google/Chrome/Default/Extensions"
            elif [[ -d "/Applications/Chromium.app" ]]; then
                browser="chromium"
                CHROME_EXTENSIONS_DIR="$HOME/Library/Application Support/Chromium/Default/Extensions"
            fi
            ;;
        "linux")
            if [[ -d "$HOME/.config/google-chrome" ]]; then
                browser="chrome"
                CHROME_EXTENSIONS_DIR="$HOME/.config/google-chrome/Default/Extensions"
            elif [[ -d "$HOME/.config/chromium" ]]; then
                browser="chromium"
                CHROME_EXTENSIONS_DIR="$HOME/.config/chromium/Default/Extensions"
            fi
            ;;
        "windows")
            if [[ -d "$LOCALAPPDATA/Google/Chrome/User Data/Default/Extensions" ]]; then
                browser="chrome"
                CHROME_EXTENSIONS_DIR="$LOCALAPPDATA/Google/Chrome/User Data/Default/Extensions"
            fi
            ;;
    esac
    
    echo "$browser"
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    local os=$(detect_os)
    log_info "Detected OS: $os"
    
    if [[ "$os" == "unknown" ]]; then
        log_error "Unsupported operating system"
        exit 1
    fi
    
    # Check for required tools
    if ! command_exists curl; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command_exists unzip; then
        log_error "unzip is required but not installed"
        exit 1
    fi
    
    # Check for browser
    local browser=$(detect_browser "$os")
    if [[ -z "$browser" ]]; then
        log_error "No supported browser found (Chrome/Chromium required)"
        exit 1
    fi
    
    log_success "System requirements check passed"
    log_info "Detected browser: $browser"
}

# Download and extract extension
download_extension() {
    log_info "Downloading extension..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Would download from: $LATEST_RELEASE_URL"
        return 0
    fi
    
    # Create install directory
    mkdir -p "$INSTALL_DIR"
    
    # Download extension
    local temp_file=$(mktemp)
    if ! curl -fsSL "$LATEST_RELEASE_URL" -o "$temp_file"; then
        log_error "Failed to download extension"
        exit 1
    fi
    
    # Extract extension
    if ! unzip -q "$temp_file" -d "$INSTALL_DIR"; then
        log_error "Failed to extract extension"
        exit 1
    fi
    
    rm "$temp_file"
    log_success "Extension downloaded and extracted"
}

# Install extension in browser
install_extension() {
    log_info "Installing extension in browser..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Would install extension to: $CHROME_EXTENSIONS_DIR"
        return 0
    fi
    
    # Create extensions directory if it doesn't exist
    mkdir -p "$CHROME_EXTENSIONS_DIR"
    
    # Copy extension files
    local extension_id="local-fill-extension"
    local extension_dir="$CHROME_EXTENSIONS_DIR/$extension_id"
    
    if [[ -d "$extension_dir" ]]; then
        log_warning "Extension already exists, updating..."
        rm -rf "$extension_dir"
    fi
    
    cp -r "$INSTALL_DIR" "$extension_dir"
    
    log_success "Extension installed successfully"
    log_info "Extension ID: $extension_id"
}

# Create desktop shortcut (optional)
create_shortcut() {
    local os="$1"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Would create desktop shortcut for $os"
        return 0
    fi
    
    case "$os" in
        "macos")
            # Create application bundle (simplified)
            log_info "Creating application bundle..."
            ;;
        "linux")
            # Create .desktop file
            log_info "Creating desktop shortcut..."
            ;;
        "windows")
            # Create .lnk file
            log_info "Creating desktop shortcut..."
            ;;
    esac
}

# Show post-installation instructions
show_instructions() {
    log_success "Installation completed successfully!"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Open your browser and go to chrome://extensions/"
    echo "2. Enable 'Developer mode' (toggle in top right)"
    echo "3. Click 'Load unpacked' and select: $CHROME_EXTENSIONS_DIR/local-fill-extension"
    echo "4. Click the extension icon in your browser toolbar"
    echo "5. Import your profile JSON or use the 'Copy LLM Prompt' feature"
    echo
    echo -e "${BLUE}For more information, visit:${NC} $REPO_URL"
    echo
    echo -e "${GREEN}Happy job hunting! 🎯${NC}"
}

# Main installation function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    Local-Fill Installer                     ║"
    echo "║              Privacy-First Job Autofill Extension           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Check requirements
    check_requirements
    
    # Download extension
    download_extension
    
    # Install extension
    install_extension
    
    # Create shortcut (optional)
    local os=$(detect_os)
    create_shortcut "$os"
    
    # Show instructions
    show_instructions
}

# Run main function
main "$@"
