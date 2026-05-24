# 🖥️ HACK MASTER - CMD/Terminal Instructions Guide

**Complete Guide for Running Security Tools from Command Line**

---

## 🎯 Overview

HACK MASTER now provides **complete, downloadable ZIP file bundles** with **step-by-step CMD/Terminal instructions** for every security tool. No more guessing how to run tools - just follow the exact commands provided!

---

## 📦 What You Get

When you request a security tool from HACK MASTER, you receive:

### 1. Complete ZIP File Bundle
```
📁 tool_name_v1.0.zip
├── 📄 main_script.py (or .sh, .bat, .ps1)
├── 📄 config.json
├── 📄 requirements.txt
├── 📄 README.md
└── 📁 modules/ (if needed)
    ├── 📄 helper.py
    └── 📄 utils.py
```

### 2. All Files with Complete Code
- **Main script** - Fully working code with zero errors
- **Configuration** - Ready-to-use config files
- **Requirements** - All dependencies listed
- **Documentation** - Complete README with instructions
- **Modules** - Supporting files (if needed)

### 3. Step-by-Step CMD Instructions
- **Windows CMD** - Exact commands for Command Prompt
- **Linux/Mac Terminal** - Bash commands for Unix systems
- **PowerShell** - Commands for PowerShell users
- **All platforms covered** - Works everywhere!

### 4. Usage Examples
- **Basic usage** - Simple examples to get started
- **Advanced usage** - Complex scenarios with all options
- **Real-world examples** - Practical use cases

### 5. Troubleshooting Guide
- **Common issues** - Problems you might encounter
- **Solutions** - How to fix each issue
- **Tips** - Pro tips for smooth operation

---

## 🖥️ CMD Instructions Format

### Windows CMD Example

```cmd
Step 1: Extract ZIP file to C:\tools\port_scanner
   - Right-click the ZIP file
   - Select "Extract All"
   - Choose destination: C:\tools\port_scanner

Step 2: Open Command Prompt as Administrator
   - Press Win + X
   - Select "Command Prompt (Admin)"

Step 3: Navigate to tool directory
   cd C:\tools\port_scanner

Step 4: Install Python (if not installed)
   - Download from: https://www.python.org/downloads/
   - Install with "Add to PATH" checked

Step 5: Install dependencies
   pip install -r requirements.txt

Step 6: Verify installation
   python port_scanner.py --version

Step 7: View help menu
   python port_scanner.py --help

Step 8: Run basic scan
   python port_scanner.py --target 192.168.1.1

Step 9: Run advanced scan
   python port_scanner.py --target 192.168.1.0/24 --ports 80,443,8080 --output results.json

Step 10: View results
   type results.json
```

### Linux/Mac Terminal Example

```bash
Step 1: Extract ZIP file
   unzip port_scanner_v1.0.zip -d ~/tools/

Step 2: Navigate to directory
   cd ~/tools/port_scanner_v1.0

Step 3: Make executable
   chmod +x port_scanner.py

Step 4: Install dependencies
   pip3 install -r requirements.txt

Step 5: Run basic scan
   python3 port_scanner.py --target 192.168.1.1

Step 6: Run with sudo (for raw sockets)
   sudo python3 port_scanner.py --target 192.168.1.1 --port-range 1-65535

Step 7: Save results
   python3 port_scanner.py --target 192.168.1.1 --output ~/scan_results.json
```

### PowerShell Example

```powershell
Step 1: Extract ZIP to C:\tools\port_scanner

Step 2: Open PowerShell as Administrator
   - Press Win + X
   - Select "Windows PowerShell (Admin)"

Step 3: Navigate to directory
   cd C:\tools\port_scanner

Step 4: Allow script execution
   Set-ExecutionPolicy Bypass -Scope Process

Step 5: Install dependencies
   pip install -r requirements.txt

Step 6: Run scan
   python port_scanner.py --target 192.168.1.1

Step 7: View results
   Get-Content results.json | ConvertFrom-Json
```

---

## 📋 Real Example: Network Port Scanner

### Request
```
"Create a network port scanner in Python"
```

### Response from HACK MASTER

#### 📁 File Bundle Structure
```
📁 network_port_scanner_v1.0.zip
├── 📄 port_scanner.py
├── 📄 config.json
├── 📄 requirements.txt
└── 📄 README.md
```

#### 📄 Files Provided
1. **port_scanner.py** - Complete Python script (200+ lines)
2. **config.json** - Configuration with default settings
3. **requirements.txt** - Dependencies (socket, argparse, etc.)
4. **README.md** - Full documentation

#### 🖥️ CMD Instructions (Windows)
```cmd
1. Extract to: C:\tools\port_scanner
2. Open CMD as Admin
3. cd C:\tools\port_scanner
4. pip install -r requirements.txt
5. python port_scanner.py --help
6. python port_scanner.py --target 192.168.1.1
7. python port_scanner.py --target 192.168.1.1 --ports 80,443,8080
8. python port_scanner.py --target 192.168.1.0/24 --output scan.json
```

#### 📋 Usage Examples
```cmd
# Scan single host, common ports
python port_scanner.py --target 192.168.1.1

# Scan specific ports
python port_scanner.py --target example.com --ports 80,443,8080,3306

# Scan port range
python port_scanner.py --target 192.168.1.1 --port-range 1-1000

# Scan subnet
python port_scanner.py --target 192.168.1.0/24 --ports 80,443

# Fast scan with more threads
python port_scanner.py --target 192.168.1.1 --threads 200

# Save results
python port_scanner.py --target 192.168.1.1 --output results.json

# Verbose output
python port_scanner.py --target 192.168.1.1 --verbose
```

#### 🔧 Troubleshooting
```
Issue: "pip: command not found"
Solution: Install Python with pip, or use: python -m pip install -r requirements.txt

Issue: "Permission denied"
Solution: Run CMD as Administrator

Issue: "Connection timeout"
Solution: Increase timeout: --timeout 2

Issue: "Module not found"
Solution: pip install -r requirements.txt --force-reinstall
```

---

## 🎯 How to Use HACK MASTER

### Step 1: Request a Tool
Open HACK MASTER mode and request any security tool:
- "Create a port scanner"
- "Build a SQL injection tester"
- "Make a WiFi analyzer"
- "Create a password hash cracker"
- "Build a web vulnerability scanner"

### Step 2: Receive Complete Bundle
HACK MASTER provides:
- ✅ Complete file structure
- ✅ All files with full code
- ✅ Step-by-step CMD instructions
- ✅ Usage examples
- ✅ Troubleshooting guide

### Step 3: Copy Files
Copy all provided files to your computer:
1. Create the directory structure
2. Save each file with the exact name
3. Ensure all files are in the correct location

### Step 4: Follow CMD Instructions
Follow the step-by-step instructions exactly:
1. Extract/create files in the specified directory
2. Open CMD/Terminal as Administrator
3. Navigate to the tool directory
4. Install dependencies
5. Run the tool with provided examples

### Step 5: Use the Tool
Start using the tool with the examples provided:
- Try basic usage first
- Then try advanced options
- Refer to troubleshooting if issues arise

---

## 💡 Pro Tips

### For Windows Users
1. **Always run CMD as Administrator** for network tools
2. **Add Python to PATH** during installation
3. **Use full paths** if commands don't work: `C:\Python39\python.exe`
4. **Check firewall** if network tools don't work
5. **Use PowerShell** for better output formatting

### For Linux/Mac Users
1. **Use sudo** for tools that need raw socket access
2. **Make scripts executable**: `chmod +x script.py`
3. **Use python3** instead of python on newer systems
4. **Check permissions** if you get "Permission denied"
5. **Use virtual environments** to avoid dependency conflicts

### For All Users
1. **Read the README** - It contains important information
2. **Start with --help** - See all available options
3. **Try basic examples first** - Get familiar with the tool
4. **Check config.json** - Customize settings if needed
5. **Save results** - Use --output to save scan results
6. **Use verbose mode** - Add --verbose for detailed output

---

## 🔧 Common Commands Reference

### Installation Commands
```bash
# Windows
pip install -r requirements.txt

# Linux/Mac
pip3 install -r requirements.txt

# With specific Python version
python3.9 -m pip install -r requirements.txt

# Force reinstall
pip install -r requirements.txt --force-reinstall

# Install in user directory
pip install -r requirements.txt --user
```

### Running Commands
```bash
# Basic run
python script.py

# With arguments
python script.py --target 192.168.1.1 --port 80

# With sudo (Linux/Mac)
sudo python3 script.py --target 192.168.1.1

# In background (Linux/Mac)
python3 script.py --target 192.168.1.1 &

# Redirect output
python script.py --target 192.168.1.1 > output.txt
```

### Troubleshooting Commands
```bash
# Check Python version
python --version

# Check pip version
pip --version

# List installed packages
pip list

# Check if module is installed
python -c "import socket; print('OK')"

# Reinstall package
pip uninstall package_name
pip install package_name

# Clear pip cache
pip cache purge
```

---

## 🌟 Benefits

### Before (Old Way)
❌ Just code snippets
❌ No clear instructions
❌ Guess how to run
❌ Figure out dependencies
❌ No troubleshooting help
❌ Incomplete files

### After (HACK MASTER Way)
✅ Complete ZIP file bundles
✅ Step-by-step CMD instructions
✅ Exact commands to run
✅ All dependencies listed
✅ Troubleshooting guide included
✅ All files complete and working
✅ Ready to use immediately
✅ Works on all platforms

---

## 🎉 Example Tools You Can Request

### Network Security
- Port scanner with multi-threading
- Network mapper with device discovery
- Packet sniffer with protocol analysis
- Traffic analyzer with bandwidth monitoring
- DNS enumeration tool
- Subdomain discovery tool

### Web Security
- SQL injection tester with multiple payloads
- XSS scanner with DOM analysis
- Directory brute forcer with wordlists
- Web crawler with sitemap generation
- API security tester
- Cookie analyzer

### Password Security
- Hash cracker supporting MD5, SHA1, SHA256
- Brute force tool with charset options
- Dictionary attack with wordlist support
- Password generator with strength meter
- Hash identifier

### Wireless Security
- WiFi analyzer with channel scanning
- WPA/WPA2 handshake capture
- Network deauthentication tool
- Signal strength analyzer

### And Many More!
- Forensics tools
- Encryption tools
- OSINT tools
- Malware analysis tools
- Mobile security tools
- Custom tools for any purpose

---

## 📞 Support

### Getting Help
1. **Ask in HACK MASTER** - Follow-up questions welcome
2. **Check README** - Review provided documentation
3. **Try troubleshooting section** - Common issues covered
4. **Use --help flag** - See all available options

### Common Questions

**Q: Do I need to create a ZIP file?**
A: No! Just copy all the files provided into a folder. The "ZIP" is just to show you the structure.

**Q: What if I don't have Python installed?**
A: Download from python.org and install with "Add to PATH" option checked.

**Q: Can I modify the code?**
A: Yes! All code is provided for you to use and modify as needed.

**Q: Do these tools really work?**
A: Yes! All code is complete and tested with ZERO ERRORS guaranteed.

**Q: Is it legal to use these tools?**
A: Only on systems you own or have written permission to test. Always follow the law.

---

## 🛡️ Legal Notice

**IMPORTANT**: All tools provided by HACK MASTER are for:
- ✅ Educational purposes
- ✅ Authorized security testing
- ✅ Your own systems
- ✅ Systems with written permission

**NEVER use for**:
- ❌ Unauthorized access
- ❌ Illegal activities
- ❌ Attacking others
- ❌ Violating privacy

**You are responsible for how you use these tools. Always follow the law.**

---

## 🎯 Conclusion

HACK MASTER now provides **complete, downloadable file bundles** with **step-by-step CMD/Terminal instructions** for every security tool. No more guessing, no more incomplete code, no more "how do I run this?" - just follow the exact commands and start using professional security tools immediately!

**Features:**
✅ Complete ZIP file bundles
✅ All files with working code
✅ Step-by-step CMD instructions for Windows/Linux/Mac/PowerShell
✅ Multiple usage examples
✅ Comprehensive troubleshooting
✅ Zero errors guaranteed
✅ Ready to use immediately

**Start using HACK MASTER today and get professional security tools with complete instructions!**

---

**Created by Syed Shujan from Kashmir - 1 March 2026**

**Part of Red Whale V1 - The Ultimate AI Assistant**

🛡️ **HACK MASTER** - Complete File Bundles - Step-by-Step CMD Instructions - Zero Errors
