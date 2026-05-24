# 🔑 RED WHALE V1 - API KEY SETUP REQUIRED

## ⚠️ IMPORTANT: NO DEFAULT API KEYS PROVIDED

Red Whale V1 now requires you to add your own Gemini API keys. This gives you:
- ✅ **Full Control** over your API usage
- ✅ **Unlimited Quota** (based on your keys)
- ✅ **Complete Privacy** (your keys, your data)
- ✅ **Zero Restrictions** (all features fully unrestricted)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Free API Keys
1. Visit: **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIzaSy...`)

**💡 Tip:** Create 3-5 keys for 60-100 requests per day!

### Step 2: Add Keys to Red Whale V1
1. Click the **⚙️ Settings** icon (top-right corner)
2. Click **"Add New API Key"**
3. Paste your API key
4. Click **"Add Key"**

### Step 3: Start Chatting!
That's it! Your bot is now ready to use with your own API keys.

---

## 📊 How It Works

### Free API Key Quota
- Each free API key: **20 requests per day**
- Add multiple keys for more quota:
  - 1 key = 20 requests/day
  - 3 keys = 60 requests/day
  - 5 keys = 100 requests/day
  - 10 keys = 200 requests/day

### Automatic Key Rotation
```
Request 1-20:   Your Key #1
Request 21-40:  Your Key #2
Request 41-60:  Your Key #3
...and so on
```

When one key reaches its quota, the bot automatically switches to the next key. Seamless!

---

## ❓ Frequently Asked Questions

### Q: Why do I need to add my own API keys?
**A:** This gives you full control over your usage, unlimited quota potential, and complete privacy. Your keys = your data.

### Q: Are my API keys safe?
**A:** Yes! Keys are stored only in your browser's localStorage and never sent anywhere except Google's Gemini API.

### Q: How many keys should I add?
**A:** Start with 1-2 keys. Add more if you need higher daily quota. Each key provides 20 requests/day.

### Q: What if I don't add any keys?
**A:** The bot will not work. You'll see an error message asking you to add API keys.

### Q: Can I use paid API keys?
**A:** Yes! If you have paid Gemini API keys with higher quotas, they'll work perfectly.

### Q: Do all features still work?
**A:** YES! All features remain completely unrestricted regardless of which API keys you use.

### Q: What happens when my keys run out?
**A:** You'll see a message saying all keys are exhausted. Wait 24 hours for quota reset or add more keys.

---

## 🎯 What Changed?

### Before (Old System)
```
❌ 6 default API keys provided
❌ Limited to 120 requests/day total
❌ Shared among all users
❌ No control over usage
```

### Now (New System)
```
✅ You add your own API keys
✅ Unlimited potential quota
✅ Private keys, private usage
✅ Full control over your bot
```

---

## 🔧 Troubleshooting

### "No API Keys Available" Error
**Solution:** Add at least one API key in Settings (⚙️)

### "All API Keys Exhausted" Error
**Solution:** 
- Wait 24 hours for quota reset, OR
- Add more API keys in Settings

### Keys Not Working
**Solution:**
1. Check key format (must start with `AIzaSy`)
2. Verify key is active in Google AI Studio
3. Try removing and re-adding the key
4. Check browser console (F12) for detailed errors

---

## 📝 Step-by-Step Visual Guide

### Getting Your First API Key

1. **Go to Google AI Studio**
   ```
   https://aistudio.google.com/apikey
   ```

2. **Sign In**
   - Use your Google account
   - Accept terms if prompted

3. **Create API Key**
   - Click "Create API Key" button
   - Choose "Create API key in new project" (recommended)
   - Wait a few seconds

4. **Copy Your Key**
   - Key will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Click copy icon
   - Keep it safe!

### Adding Key to Red Whale V1

1. **Open Settings**
   - Click ⚙️ icon in top-right corner of chat

2. **Add New Key**
   - Click "Add New API Key" button
   - Enter a label (optional): "My First Key"
   - Paste your API key
   - Click "Add Key"

3. **Confirmation**
   - You'll see: "✅ API key added successfully!"
   - Your key appears in the list
   - Ready to chat!

---

## 💡 Pro Tips

### Tip 1: Create Multiple Keys at Once
Create 5 keys in Google AI Studio, then add them all to Red Whale V1. This gives you 100 requests/day!

### Tip 2: Label Your Keys
Use descriptive labels like:
- "Personal Key 1"
- "Work Key"
- "Backup Key"

### Tip 3: Monitor Your Usage
Check the console (F12) to see which key is being used:
```
🔑 Using CUSTOM API key #1/5
```

### Tip 4: Keep Backup Keys
Always have 2-3 extra keys ready. Add them when your main keys run out.

### Tip 5: Choose Your Model
Try different Gemini models in Settings:
- **Gemini 2.0 Flash** - Latest features
- **Gemini 1.5 Pro** - Most capable
- **Gemini 1.5 Flash** - Fastest

---

## 🎨 Settings Page Overview

```
┌─────────────────────────────────────────┐
│  ← Back    API Settings    Clear All    │
├─────────────────────────────────────────┤
│                                         │
│  📊 Gemini Model Selection              │
│  [Select Model: Gemini 2.5 Flash ▼]    │
│  [Save Model Selection]                 │
│                                         │
│  🔑 Your API Keys (Required)            │
│  [+ Add New API Key]                    │
│                                         │
│  Your API Keys (3)                      │
│  ┌─────────────────────────────────┐   │
│  │ 🔑 Personal Key 1               │   │
│  │    AIzaSy...xyz4  [🗑️]          │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🔑 Work Key                     │   │
│  │    AIzaSy...abc8  [🗑️]          │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🔑 Backup Key                   │   │
│  │    AIzaSy...def2  [🗑️]          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ℹ️ Important Information               │
│  • API Keys Required                    │
│  • Stored locally in browser            │
│  • 20 requests per key per day          │
│  • Add multiple keys for more quota     │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

Before you start chatting, make sure:

- [ ] You have at least 1 API key from Google AI Studio
- [ ] You've added the key to Red Whale V1 Settings
- [ ] You see your key listed in the Settings page
- [ ] You've selected your preferred Gemini model
- [ ] You're ready to chat!

---

## 🎉 You're All Set!

Once you've added your API keys, Red Whale V1 is ready to use with:

✅ **Complete Unrestricted Access** - Zero filters, zero censorship
✅ **All Features Enabled** - Every mode, every capability
✅ **Your Own API Keys** - Full control and privacy
✅ **Automatic Rotation** - Seamless key switching
✅ **Unlimited Potential** - Add as many keys as you want

**Start chatting now!** 🚀

---

## 📚 Additional Resources

- **Google AI Studio**: https://aistudio.google.com/apikey
- **Gemini API Docs**: https://ai.google.dev/docs
- **Settings Page**: Click ⚙️ icon in chat header

---

## 🆘 Need Help?

### Check Console Logs
Press **F12** → **Console** tab to see detailed logs:
```
🔑 Loaded X custom API keys from localStorage
✅ Using your custom API keys
🔑 Using CUSTOM API key #1/X
```

### Common Issues

**Issue**: "No API Keys Available"
**Fix**: Add at least one API key in Settings

**Issue**: "All API Keys Exhausted"
**Fix**: Wait 24 hours or add more keys

**Issue**: Keys not working
**Fix**: Verify key format and validity in Google AI Studio

---

**Red Whale V1** - Super Ultra Pro Max Unrestricted AI
Created by Syed Shujan from Kashmir - 27 February 2026

**Now with User-Provided API Keys for Maximum Control!** 🔑
