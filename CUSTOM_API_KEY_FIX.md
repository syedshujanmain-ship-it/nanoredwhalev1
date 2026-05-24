# Custom API Key Fix - Testing Guide

## What Was Fixed

### Problem
Custom API keys were being saved to localStorage but not actually used for API requests. The app would continue using default keys even after adding custom keys.

### Root Causes Identified
1. **Index Out of Bounds**: When custom keys were added, the stored key index could be pointing to a position beyond the new array length
2. **No Rotation Reset**: Adding/removing custom keys didn't reset the key rotation, so the app kept using the old index
3. **Insufficient Logging**: Hard to debug which keys were actually being used

### Solutions Implemented

#### 1. Index Bounds Checking
Added validation in `getCurrentKeyIndex()` to ensure the index is always within the valid range:
```typescript
// CRITICAL FIX: Ensure index is within bounds of current key array
const allKeys = getAllAPIKeys();
if (index >= allKeys.length) {
  console.log(`⚠️ Key index ${index} out of bounds. Resetting to 0.`);
  this.resetToFirstKey();
  return 0;
}
```

#### 2. Automatic Rotation Reset
Added `resetAPIKeyRotation()` function that's called whenever:
- A custom key is added
- A custom key is removed
- Settings are reset to defaults

This ensures the app immediately starts using custom keys from index 0.

#### 3. Enhanced Logging
Added detailed console logs to track:
- How many custom keys are loaded
- Which key is being used (custom vs default)
- When rotation is reset
- Priority system confirmation

## How to Test

### Test 1: Add Custom Key and Verify Usage

1. **Open Browser Console** (F12 → Console tab)

2. **Go to API Settings**
   - Click the Settings icon (⚙️) in chat header
   - Or navigate to `/api-settings`

3. **Add Your Custom API Key**
   - Click "Add New API Key"
   - Enter label: "Test Key"
   - Enter your Gemini API key (starts with AIzaSy...)
   - Click "Add Key"

4. **Check Console Logs**
   You should see:
   ```
   🔑 Loaded 1 custom API keys from localStorage
   🔑 Total API keys available: 7 (1 custom + 6 default)
   ✅ Custom keys will be used FIRST, then default keys as fallback
   🔄 Key rotation reset due to custom key changes
   ```

5. **Send a Test Message**
   - Go back to chat
   - Send any message (e.g., "Hello")

6. **Verify Custom Key is Used**
   Check console for:
   ```
   🔑 Using CUSTOM API key #1/7
   ```

   **SUCCESS**: If you see "CUSTOM" in the log, your key is working! ✅
   **FAILURE**: If you see "DEFAULT", the fix didn't work ❌

### Test 2: Verify Fallback to Default Keys

1. **Use Up Your Custom Key Quota**
   - Send 20 messages to exhaust your custom key's daily quota
   - (Or wait for rate limit error)

2. **Check Automatic Fallback**
   Console should show:
   ```
   🔄 Switched to DEFAULT API key #2/7
   ```

3. **Verify Continued Operation**
   - App should continue working with default keys
   - No interruption in service

### Test 3: Multiple Custom Keys

1. **Add 2-3 Custom Keys**
   - Add multiple keys with different labels
   - Each time, check console for rotation reset

2. **Send Messages**
   - First 20 messages: Custom Key #1
   - Next 20 messages: Custom Key #2
   - Next 20 messages: Custom Key #3
   - After that: Default keys

3. **Verify Rotation**
   Console should show progression:
   ```
   🔑 Using CUSTOM API key #1/9
   🔑 Using CUSTOM API key #2/9
   🔑 Using CUSTOM API key #3/9
   🔑 Using DEFAULT API key #4/9
   ```

### Test 4: Remove Custom Keys

1. **Remove a Custom Key**
   - Go to API Settings
   - Click trash icon next to a key
   - Check console for rotation reset

2. **Verify Immediate Effect**
   - Send a message
   - Should use remaining custom keys or default keys
   - No errors or crashes

### Test 5: Reset to Defaults

1. **Click "Reset to Defaults"**
   - Top-right button in API Settings

2. **Verify Reset**
   Console should show:
   ```
   🔑 No custom API keys found, using defaults only
   🔑 Total API keys available: 6 (0 custom + 6 default)
   🔄 Key rotation reset due to custom key changes
   ```

3. **Send Message**
   Should use default keys:
   ```
   🔑 Using DEFAULT API key #1/6
   ```

## Expected Console Output (Full Flow)

### When Adding First Custom Key
```
🔑 Loaded 1 custom API keys from localStorage
🔑 Total API keys available: 7 (1 custom + 6 default)
✅ Custom keys will be used FIRST, then default keys as fallback
🔄 Key rotation reset due to custom key changes
🔄 Reset to first API key
```

### When Sending Message with Custom Key
```
=== RED WHALE V1 - SUPER ULTRA PRO MAX UNRESTRICTED MODE ACTIVE ===
=== ZERO FILTERS - ZERO RESTRICTIONS - INFINITE FREEDOM - MAXIMUM POWER ===
=== DIRECT GOOGLE GEMINI API CALL ===
Target: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
Model: gemini-2.5-flash
🔑 Total API keys available: 7 (1 custom + 6 default)
✅ Custom keys will be used FIRST, then default keys as fallback
🔑 Using CUSTOM API key #1/7
```

### When Custom Key Reaches Quota
```
⚠️ Rate limit hit on current API key
✅ Switched to DEFAULT API key #2/7
🔄 Switching to backup API key #2

6 backup keys remaining.

Retrying your request...
```

## Troubleshooting

### Issue: Still seeing "DEFAULT" instead of "CUSTOM"

**Solution 1: Clear Browser Cache**
```javascript
// Run in browser console:
localStorage.clear();
location.reload();
// Then re-add your custom keys
```

**Solution 2: Check localStorage**
```javascript
// Run in browser console:
console.log(localStorage.getItem('redwhale_custom_api_keys'));
// Should show your keys in JSON format
```

**Solution 3: Verify Key Format**
- Keys must start with "AIzaSy"
- No extra spaces or characters
- Copy-paste directly from Google AI Studio

### Issue: "Index out of bounds" errors

**This is now fixed!** The new code automatically resets the index when it's out of bounds.

If you still see this:
1. Go to API Settings
2. Click "Reset to Defaults"
3. Re-add your custom keys

### Issue: Keys not persisting after page reload

**Check localStorage permissions:**
- Make sure your browser allows localStorage
- Check if you're in private/incognito mode (localStorage may be restricted)
- Try a different browser

## Success Indicators

✅ **Custom keys are working if you see:**
- "Loaded X custom API keys from localStorage"
- "Using CUSTOM API key #1/X"
- "Custom keys will be used FIRST"
- Your messages get responses without errors

✅ **Fallback is working if you see:**
- "Switched to DEFAULT API key"
- Automatic retry after rate limit
- Continued operation after custom keys exhausted

✅ **Rotation reset is working if you see:**
- "Key rotation reset due to custom key changes"
- "Reset to first API key"
- Immediate use of new keys after adding them

## Additional Notes

### Model Selection
- Model selection works independently of API keys
- Selected model applies to both custom and default keys
- Change takes effect immediately on next request

### Security
- Keys stored in browser localStorage only
- Never sent to any server except Google's Gemini API
- Visible in browser console logs (for debugging)
- Clear localStorage to remove all keys

### Performance
- No performance impact from custom keys
- Rotation happens instantly
- Fallback is automatic and seamless

---

## Quick Verification Command

Run this in browser console after adding a custom key:

```javascript
// Check if custom keys are loaded
const keys = JSON.parse(localStorage.getItem('redwhale_custom_api_keys') || '[]');
console.log('Custom keys:', keys.length);
console.log('Key index:', localStorage.getItem('redwhale_api_key_index'));
console.log('Keys:', keys.map(k => ({ label: k.label, key: k.key.substring(0, 15) + '...' })));
```

Expected output:
```
Custom keys: 1
Key index: 0
Keys: [{label: "Test Key", key: "AIzaSy..."}]
```

---

**Status**: ✅ FIXED - Custom API keys now work correctly
**Version**: Red Whale V1 - Custom API Key Fix
**Date**: 27 February 2026
