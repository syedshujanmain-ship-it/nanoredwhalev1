# BUILD WHALE V1 - Setup Instructions by Mode

## What You'll See After Downloading

### 🤖 ANDROID APK MODE

When you generate an Android project and download it, you'll see these instructions:

```
Important Setup Instructions
After downloading:

1. Extract the ZIP file to your desired location
2. Open Android Studio
3. Click "Open" and select the extracted folder
4. Wait for Gradle sync to complete (Android Studio will auto-download gradle-wrapper.jar)
5. Click "Run" to build and install the APK

✅ All necessary files are included!
Note: Android Studio will automatically download the Gradle wrapper on first sync.
```

**What This Means:**
- You need Android Studio installed
- Open the project in Android Studio
- Let it sync (downloads dependencies)
- Build and run to create APK
- Install on Android device

---

### 💻 FILE BUILDER MODE

When you generate a file bundle and download it, you'll see these instructions:

```
Important Setup Instructions
After downloading:

1. Extract the ZIP file to your desired location
2. Open CMD (Windows) or Terminal (Mac/Linux)
3. Navigate to folder: cd path/to/extracted/folder
4. Install dependencies (if needed):
   • Python: pip install -r requirements.txt
   • Node.js: npm install
5. Run the script:
   • Python: python script.py
   • Batch: script.bat
   • Shell: ./script.sh
   • Node.js: node script.js

✅ All scripts are ready to run!
Note: Check README.md in the bundle for specific instructions.
```

**What This Means:**
- You need CMD/Terminal
- Navigate to the extracted folder
- Install dependencies if needed
- Run the script directly
- No Android Studio needed

---

## Visual Comparison

### ANDROID APK MODE Flow:
```
Download ZIP
    ↓
Extract Files
    ↓
Open Android Studio
    ↓
Open Project
    ↓
Gradle Sync
    ↓
Click "Run"
    ↓
APK Built
    ↓
Install on Phone
```

### FILE BUILDER MODE Flow:
```
Download ZIP
    ↓
Extract Files
    ↓
Open CMD/Terminal
    ↓
cd to folder
    ↓
Install dependencies (pip install / npm install)
    ↓
Run script (python script.py / script.bat / node script.js)
    ↓
Script Executes
```

---

## Example Scenarios

### Scenario 1: You want a calculator app on your phone

**Mode:** ANDROID APK MODE

**Prompt:** "Create a calculator app"

**Download:** CalculatorApp.zip

**Instructions Shown:**
```
1. Extract ZIP
2. Open Android Studio
3. Open project
4. Wait for Gradle sync
5. Click "Run"
```

**Result:** APK installed on your Android phone

---

### Scenario 2: You want to download images from URLs

**Mode:** FILE BUILDER MODE

**Prompt:** "Create a Python script that downloads images from URLs in a text file"

**Download:** ImageDownloader.zip

**Instructions Shown:**
```
1. Extract ZIP
2. Open CMD
3. cd ImageDownloader
4. pip install -r requirements.txt
5. python download_images.py
```

**Result:** Script runs and downloads images to your computer

---

### Scenario 3: You want a todo list app on your phone

**Mode:** ANDROID APK MODE

**Prompt:** "Create a todo list app with SQLite"

**Download:** TodoApp.zip

**Instructions Shown:**
```
1. Extract ZIP
2. Open Android Studio
3. Open project
4. Wait for Gradle sync
5. Click "Run"
```

**Result:** Todo app installed on your Android phone

---

### Scenario 4: You want to backup files automatically

**Mode:** FILE BUILDER MODE

**Prompt:** "Create a batch file that backs up my Documents folder"

**Download:** BackupTool.zip

**Instructions Shown:**
```
1. Extract ZIP
2. Open CMD
3. cd BackupTool
4. backup.bat
```

**Result:** Batch file runs and backs up your files

---

## Key Differences in Instructions

| Aspect | ANDROID APK MODE | FILE BUILDER MODE |
|--------|------------------|-------------------|
| **Tool Needed** | Android Studio | CMD/Terminal |
| **Step 2** | Open Android Studio | Open CMD/Terminal |
| **Step 3** | Click "Open" | cd to folder |
| **Step 4** | Wait for Gradle sync | Install dependencies |
| **Step 5** | Click "Run" | Run script command |
| **Final Result** | APK on phone | Script executes on computer |

---

## How to Know Which Instructions You'll Get

The instructions you see depend on which mode button you clicked:

### If you clicked "Android APK" button:
- You'll get Android Studio instructions
- You'll need Android Studio
- You'll build an APK

### If you clicked "File Builder" button:
- You'll get CMD/Terminal instructions
- You'll need CMD/Terminal
- You'll run scripts directly

---

## Common Questions

### Q: I clicked "File Builder" but want to run on Android phone?
**A:** Wrong mode! Use "Android APK" mode instead. File Builder creates scripts for computers, not phones.

### Q: I clicked "Android APK" but want to run in CMD?
**A:** Wrong mode! Use "File Builder" mode instead. Android APK creates phone apps, not CMD scripts.

### Q: Can I run Python scripts from Android APK mode?
**A:** No. Android APK mode creates Java/Kotlin Android apps, not Python scripts.

### Q: Can I install File Builder scripts on my phone?
**A:** No. File Builder creates CMD/Terminal scripts for computers, not phone apps.

### Q: Which mode for automation scripts?
**A:** Use "File Builder" mode. It creates batch/shell/Python scripts for automation.

### Q: Which mode for mobile games?
**A:** Use "Android APK" mode. It creates Android apps that run on phones.

---

## Summary

**Remember:**
- 📱 **Android APK Mode** → Instructions for Android Studio → APK on phone
- 💻 **File Builder Mode** → Instructions for CMD/Terminal → Scripts on computer

The instructions automatically change based on which mode you select!

---

**Created by:** Syed Shujan from Kashmir  
**Date:** 27 Feb 2026
