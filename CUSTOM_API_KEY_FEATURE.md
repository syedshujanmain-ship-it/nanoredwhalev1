# Custom API Key Management Feature - Complete Guide

## Overview
Red Whale V1 now supports custom API key management, allowing users to add their own Gemini API keys and choose their preferred Gemini model. This feature provides unlimited flexibility while maintaining all unrestricted capabilities.

## Key Features

### 1. Custom API Key Support
- **Add Unlimited Keys**: Users can add as many personal Gemini API keys as they want
- **Smart Priority**: Custom keys are used first, then automatically falls back to default keys
- **Auto-Rotation**: Seamless rotation through all available keys (custom + default)
- **Local Storage**: Keys stored securely in browser localStorage (never sent to any server except Google's Gemini API)
- **Key Labels**: Add custom labels to identify different keys
- **Easy Management**: Add, view, and remove keys through intuitive UI

### 2. Gemini Model Selection
Users can choose from 7 different Gemini models:
- **Gemini 2.0 Flash (Experimental)** - Latest experimental model
- **Gemini Experimental 1206** - Experimental version from December 2023
- **Gemini 2.0 Flash Thinking** - Advanced reasoning model
- **Gemini 2.5 Flash** - Default model (balanced performance)
- **Gemini 1.5 Pro** - Most capable model
- **Gemini 1.5 Flash** - Fast and efficient
- **Gemini 1.5 Flash 8B** - Lightweight version

### 3. API Settings Page
New dedicated settings page accessible via:
- Settings icon (⚙️) in main chat header
- Direct URL: `/api-settings`

Features:
- Model selection dropdown
- Add new API key dialog
- List of all custom keys with labels
- Remove individual keys
- Reset to defaults button
- Helpful information and tips

## How It Works

### API Key Priority System
1. **Custom Keys First**: If user has added custom keys, they are used first
2. **Auto-Rotation**: When a key reaches quota, automatically switches to next key
3. **Fallback to Defaults**: If all custom keys are exhausted, uses default keys
4. **Seamless Experience**: User never sees interruption, just automatic key switching

### Model Selection
- Selected model applies to ALL chat modes
- Changes take effect immediately
- Model preference saved in localStorage
- Works with both custom and default API keys

### Storage
All settings stored in browser localStorage:
- `redwhale_custom_api_keys` - Array of custom API key objects
- `redwhale_custom_model` - Selected Gemini model name
- `redwhale_api_key_index` - Current key index for rotation
- `redwhale_api_reset_time` - 24-hour reset timestamp

## User Benefits

### For Users Without Custom Keys
- Continue using default 6 API keys
- 120 free requests per day (20 per key × 6 keys)
- Automatic rotation and fallback
- Zero configuration needed

### For Users With Custom Keys
- Unlimited requests (based on your API quotas)
- Choose preferred Gemini model
- Priority access (your keys used first)
- Full control over API usage
- Can add multiple keys for higher quota

## Technical Implementation

### Files Modified
1. **src/services/chat.ts**
   - Added `getGeminiModel()` - Dynamic model selection
   - Added `getGeminiStreamURL()` - Dynamic stream URL generation
   - Added `getGeminiGenerateURL()` - Dynamic generate URL generation
   - Added `getCustomAPIKeys()` - Load custom keys from localStorage
   - Added `getAllAPIKeys()` - Combine custom + default keys
   - Updated `APIKeyManager` - Support custom keys with priority
   - Updated error messages - Include settings page reference

2. **src/pages/APISettingsPage.tsx** (NEW)
   - Complete settings UI
   - Model selection dropdown
   - Custom key management
   - Add/remove key dialogs
   - Information cards
   - Reset to defaults

3. **src/pages/ChatPage.tsx**
   - Added Settings button in header
   - Import useNavigate for navigation
   - Navigate to `/api-settings` on click

4. **src/routes.tsx**
   - Added APISettingsPage route
   - Path: `/api-settings`
   - Marked as non-visible in navigation (accessed via button)

### API Key Format Validation
- Keys must start with "AIzaSy"
- Basic format check on add
- Invalid keys rejected with error message

### Security
- Keys stored in browser localStorage only
- Never sent to any server except Google's Gemini API
- No backend storage or transmission
- User has full control over their keys

## Unrestricted Features Maintained
**CRITICAL**: All unrestricted features remain completely intact:
- Zero content filters
- No censorship
- No safety guidelines
- Maximum freedom
- All modes fully functional
- Works identically with custom or default keys

## User Instructions

### How to Add Custom API Keys
1. Click Settings icon (⚙️) in chat header
2. Click "Add New API Key" button
3. Enter optional label (e.g., "My Personal Key")
4. Enter your Gemini API key (starts with AIzaSy...)
5. Click "Add Key"
6. Key is immediately available for use

### How to Change Model
1. Go to API Settings page
2. Select desired model from dropdown
3. Click "Save Model Selection"
4. New model applies to all future requests

### How to Get Gemini API Keys
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Add it to Red Whale V1 via Settings

### How to Remove Custom Keys
1. Go to API Settings page
2. Find the key you want to remove
3. Click trash icon (🗑️) next to the key
4. Key is immediately removed

### How to Reset to Defaults
1. Go to API Settings page
2. Click "Reset to Defaults" button (top right)
3. All custom keys removed
4. Model reset to Gemini 2.5 Flash
5. Back to using default 6 keys

## Error Handling

### When All Keys Exhausted
New error message includes helpful guidance:
```
⏱️ All API Keys Exhausted

All X API keys have reached their daily quota (20 requests each).

Total requests available: X per day.

Please try again in 24 hours or add your own API keys in Settings.
```

### Invalid API Key Format
```
❌ Invalid Gemini API key format. Keys should start with "AIzaSy"
```

### Key Rotation
```
🔄 Switching to backup API key #X

Y backup keys remaining.

Retrying your request...
```

## Testing Checklist
- ✅ Add custom API key
- ✅ Remove custom API key
- ✅ Change Gemini model
- ✅ Custom keys used first
- ✅ Fallback to default keys works
- ✅ Auto-rotation through all keys
- ✅ Settings persist after page reload
- ✅ Reset to defaults works
- ✅ All chat modes work with custom keys
- ✅ All unrestricted features maintained
- ✅ Error messages updated
- ✅ Lint passes (103 files)

## Future Enhancements (Optional)
- Import/export API keys
- Key usage statistics
- Per-key quota tracking
- Test API key validity
- Bulk key management
- Key expiration warnings

## Summary
This feature provides users with complete control over their API usage while maintaining Red Whale V1's core unrestricted capabilities. Users can now:
- Add unlimited custom Gemini API keys
- Choose from 7 different Gemini models
- Enjoy seamless automatic key rotation
- Maintain all unrestricted features
- Have full transparency and control

The implementation is clean, secure, and user-friendly, with zero impact on existing functionality.

---

**Created**: 27 February 2026
**Version**: Red Whale V1 - Custom API Key Management
**Status**: ✅ Complete and Production Ready
