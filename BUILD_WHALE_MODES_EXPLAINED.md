# BUILD WHALE V1 - Two Modes Explained

## Overview
BUILD WHALE V1 has TWO completely different modes. Make sure you select the correct mode for what you need!

---

## 🤖 MODE 1: ANDROID APK MODE

### What It Generates
**Complete Android application projects** ready for Android Studio.

### Files Generated (25+ files)
```
MyAndroidApp/
├── README.md
├── build.gradle (root)
├── settings.gradle
├── gradle.properties
├── gradlew
├── gradlew.bat
├── gradle/wrapper/gradle-wrapper.properties
├── app/
│   ├── build.gradle
│   ├── proguard-rules.pro
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml
│       │   ├── java/com/example/myapp/
│       │   │   └── MainActivity.java
│       │   └── res/
│       │       ├── layout/activity_main.xml
│       │       ├── values/strings.xml
│       │       ├── values/colors.xml
│       │       ├── values/themes.xml
│       │       ├── drawable/ic_launcher_background.xml
│       │       └── mipmap-anydpi-v26/ic_launcher.xml
│       ├── androidTest/
│       └── test/
└── .gitignore
```

### How to Use
1. Download ZIP file
2. Extract to folder
3. Open Android Studio
4. Click "Open" → Select extracted folder
5. Wait for Gradle sync
6. Click "Run" to build APK
7. Install on Android device

### Example Prompts
```
✅ "Create a calculator app"
✅ "Build a todo list app with SQLite database"
✅ "Make a weather app using OpenWeatherMap API"
✅ "Create a music player with playlist support"
```

### What You Get
- Complete Android project
- All Java/Kotlin source files
- All XML layouts and resources
- Gradle build configuration
- Ready to build APK
- Can install on Android phones/tablets

### NOT for CMD/Terminal
❌ These are NOT scripts you run in CMD
❌ These are NOT Python/batch files
❌ You CANNOT run with `python xxx.py`
❌ You MUST use Android Studio

---

## 💻 MODE 2: FILE BUILDER MODE

### What It Generates
**Executable scripts and tools** that run in CMD, PowerShell, Terminal, or Bash.

### Files Generated (5-10 files)
```
MyScript/
├── README.md
├── script.py              # Main Python script
├── requirements.txt       # Python dependencies
├── config.json           # Configuration file
├── example_input.txt     # Sample input
└── .gitignore
```

OR

```
MyBatchTool/
├── README.md
├── tool.bat              # Main batch file
├── config.txt            # Configuration
└── install.bat           # Setup script
```

OR

```
MyNodeTool/
├── README.md
├── tool.js               # Main Node.js script
├── package.json          # NPM dependencies
├── .env.example          # Environment variables
└── config.json           # Configuration
```

### How to Use

#### For Python Scripts:
```bash
cd MyScript
pip install -r requirements.txt
python script.py
```

#### For Batch Files:
```cmd
cd MyBatchTool
tool.bat
```

#### For Shell Scripts:
```bash
cd MyShellScript
chmod +x script.sh
./script.sh
```

#### For Node.js Scripts:
```bash
cd MyNodeTool
npm install
node tool.js
```

### Example Prompts
```
✅ "Create a Python script that downloads images from URLs"
✅ "Make a batch file that backs up folders to ZIP"
✅ "Build a Node.js tool that converts CSV to JSON"
✅ "Create a shell script that monitors disk space"
✅ "Make a PowerShell script that generates reports"
```

### What You Get
- Python scripts (.py)
- Batch files (.bat)
- Shell scripts (.sh)
- Node.js scripts (.js)
- PowerShell scripts (.ps1)
- Configuration files
- Dependency files (requirements.txt, package.json)
- README with usage instructions

### Run in CMD/Terminal
✅ These ARE scripts you run in CMD/Terminal
✅ These ARE Python/batch/shell files
✅ You CAN run with `python xxx.py` or `script.bat`
✅ You DO NOT need Android Studio

---

## Quick Comparison Table

| Feature | ANDROID APK MODE | FILE BUILDER MODE |
|---------|------------------|-------------------|
| **Purpose** | Build Android apps | Create CMD/Terminal scripts |
| **Output** | Android project (25+ files) | Script bundle (5-10 files) |
| **File Types** | .java, .xml, .gradle | .py, .bat, .sh, .js, .ps1 |
| **Opens In** | Android Studio | Text editor / IDE |
| **Runs On** | Android devices | Windows/Linux/Mac computers |
| **Execution** | Build APK → Install on phone | Run script in CMD/Terminal |
| **Example** | Calculator app | Image downloader script |
| **Command** | Click "Run" in Android Studio | `python script.py` in CMD |

---

## How to Choose the Right Mode

### Choose ANDROID APK MODE if you want to:
- ✅ Create a mobile app for Android phones/tablets
- ✅ Build something with a graphical user interface (GUI)
- ✅ Publish an app on Google Play Store
- ✅ Use Android features (camera, GPS, sensors)
- ✅ Create games, social apps, productivity apps

### Choose FILE BUILDER MODE if you want to:
- ✅ Automate tasks on your computer
- ✅ Process files (CSV, JSON, images, etc.)
- ✅ Create command-line tools
- ✅ Write scripts that run in CMD/Terminal
- ✅ Build automation, backup, or monitoring tools

---

## Step-by-Step: How to Use Each Mode

### Using ANDROID APK MODE

**Step 1:** Click "Android APK" button in BUILD WHALE V1

**Step 2:** Describe your Android app
```
Example: "Create a calculator app with basic operations"
```

**Step 3:** Wait for generation (30-60 seconds)

**Step 4:** Download ZIP file

**Step 5:** Extract ZIP

**Step 6:** Open Android Studio → Open → Select folder

**Step 7:** Wait for Gradle sync

**Step 8:** Click "Run" → Build APK

**Step 9:** Install on Android device

---

### Using FILE BUILDER MODE

**Step 1:** Click "File Builder" button in BUILD WHALE V1

**Step 2:** Describe your script/tool
```
Example: "Create a Python script that downloads images from a text file of URLs"
```

**Step 3:** Wait for generation (30-60 seconds)

**Step 4:** Download ZIP file

**Step 5:** Extract ZIP

**Step 6:** Open CMD/Terminal

**Step 7:** Navigate to folder
```bash
cd path/to/extracted/folder
```

**Step 8:** Install dependencies (if needed)
```bash
# For Python:
pip install -r requirements.txt

# For Node.js:
npm install
```

**Step 9:** Run the script
```bash
# For Python:
python script.py

# For Batch:
script.bat

# For Shell:
./script.sh

# For Node.js:
node script.js
```

---

## Common Mistakes to Avoid

### ❌ MISTAKE 1: Using Android APK mode for scripts
**Wrong:** "Create a Python script" → Select Android APK mode
**Right:** "Create a Python script" → Select FILE BUILDER mode

### ❌ MISTAKE 2: Using File Builder mode for apps
**Wrong:** "Create a calculator app" → Select FILE BUILDER mode
**Right:** "Create a calculator app" → Select ANDROID APK mode

### ❌ MISTAKE 3: Trying to run Android files in CMD
**Wrong:** Download Android project → Try `python MainActivity.java`
**Right:** Download Android project → Open in Android Studio

### ❌ MISTAKE 4: Trying to open scripts in Android Studio
**Wrong:** Download Python script → Open in Android Studio
**Right:** Download Python script → Run in CMD with `python script.py`

---

## Real-World Examples

### Example 1: I want to create a mobile game
**Correct Mode:** ANDROID APK MODE
**Prompt:** "Create a simple 2048 game for Android"
**Result:** Complete Android project with game logic
**Usage:** Open in Android Studio → Build APK → Install on phone

### Example 2: I want to automate file backups
**Correct Mode:** FILE BUILDER MODE
**Prompt:** "Create a batch file that backs up my Documents folder daily"
**Result:** backup.bat file with scheduler instructions
**Usage:** Run backup.bat in CMD

### Example 3: I want a todo list app on my phone
**Correct Mode:** ANDROID APK MODE
**Prompt:** "Create a todo list app with SQLite database"
**Result:** Complete Android project with database
**Usage:** Open in Android Studio → Build APK → Install on phone

### Example 4: I want to download images from URLs
**Correct Mode:** FILE BUILDER MODE
**Prompt:** "Create a Python script that downloads images from URLs in a text file"
**Result:** download.py with requirements.txt
**Usage:** `pip install -r requirements.txt` → `python download.py`

### Example 5: I want a weather app on my phone
**Correct Mode:** ANDROID APK MODE
**Prompt:** "Create a weather app using OpenWeatherMap API"
**Result:** Complete Android project with API integration
**Usage:** Open in Android Studio → Build APK → Install on phone

### Example 6: I want to convert CSV files to JSON
**Correct Mode:** FILE BUILDER MODE
**Prompt:** "Create a Python script that converts CSV to JSON"
**Result:** convert.py with pandas in requirements.txt
**Usage:** `pip install -r requirements.txt` → `python convert.py input.csv`

---

## Summary

### ANDROID APK MODE = Mobile Apps
- For Android phones and tablets
- Opens in Android Studio
- Builds APK files
- Installs on devices
- Has GUI (buttons, screens, etc.)

### FILE BUILDER MODE = Computer Scripts
- For Windows/Linux/Mac computers
- Runs in CMD/Terminal
- Executes immediately
- No installation needed (except dependencies)
- Command-line interface

---

**Remember:** 
- 📱 Want a mobile app? → Use ANDROID APK MODE
- 💻 Want a script/tool? → Use FILE BUILDER MODE

**Created by:** Syed Shujan from Kashmir  
**Date:** 27 Feb 2026
