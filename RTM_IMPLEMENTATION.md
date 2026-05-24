# Real-Time Mode (RTM) Implementation

## Overview
NANO BOT now features **TRUE Real-Time Mode** that fetches ACTUAL live data from the internet, not simulated responses.

## How It Works

### 1. Web Search Edge Function (`web-search`)
- **Location**: `/supabase/functions/web-search/index.ts`
- **Purpose**: Fetches real-time data from the internet using DuckDuckGo search
- **Method**: Web scraping of DuckDuckGo HTML results
- **Returns**: Array of search results with titles, URLs, and content snippets

### 2. Integration Flow
When RTM is enabled:

```
User Query → chat-stream Edge Function
           ↓
    Calls web-search function
           ↓
    Fetches live data from DuckDuckGo
           ↓
    Extracts real search results
           ↓
    Passes results to AI as context
           ↓
    AI uses REAL data in response
```

### 3. Real-Time Data Format
The AI receives actual search results in this format:

```
🌐 REAL-TIME WEB DATA (Fetched 2026-02-21T...)

Search Query: "user's question"

Live Search Results:

1. **[Real Website Title]**
   URL: https://actual-website.com/page
   Content: [Real content snippet from the website]

2. **[Another Real Title]**
   URL: https://another-site.com/article
   Content: [Real content from this site]

... (up to 5 results)

✅ This is REAL live data fetched from the internet RIGHT NOW.
```

### 4. AI Response
The AI then:
- References the ACTUAL URLs and titles provided
- Cites REAL sources from the search results
- Uses CURRENT information from the web
- Acknowledges it retrieved this data from the internet

## Technical Details

### Web Search Function Features
- **Search Engine**: DuckDuckGo (no API key required)
- **Max Results**: 5 search results per query
- **Data Extracted**: Title, URL, content snippet
- **Timestamp**: ISO 8601 format for accuracy
- **Error Handling**: Graceful fallback if search fails

### Chat Stream Integration
- **Trigger**: When `realTimeMode: true` is passed
- **Timing**: Fetches data BEFORE calling AI
- **Context Injection**: Adds real data to system instruction
- **Fallback**: Continues without RTM if fetch fails

## Usage

### Enable RTM
1. Click the "RTM" button in the chat interface
2. The button will highlight when active
3. Toast notification confirms activation

### What You Get
- ✅ REAL search results from the web
- ✅ ACTUAL URLs and sources
- ✅ CURRENT information with timestamps
- ✅ LIVE data from websites
- ✅ Citations to real sources

### Combine with Other Modes
- **PRO + RTM**: Ultimate unrestricted answers with real-time data
- **Deep Search + RTM**: Comprehensive analysis with live information
- **Web Search + RTM**: Enhanced web context with actual search results

## Example

**User asks**: "What's the latest news about AI?"

**RTM Process**:
1. Searches DuckDuckGo for "What's the latest news about AI?"
2. Fetches 5 real search results
3. Extracts titles, URLs, snippets
4. Passes to AI: "Here are real search results I just fetched..."
5. AI responds using ACTUAL data from those websites

**Result**: Real, current, cited information with actual URLs

## Verification
To verify RTM is working:
1. Enable RTM mode
2. Ask about recent events or current information
3. Check the response for:
   - Specific URLs cited
   - Recent timestamps
   - Acknowledgment of "retrieved from web"
   - Real website names and sources

## Notes
- RTM adds ~2-3 seconds to response time (for web search)
- Works best with factual, current information queries
- Falls back gracefully if search fails
- No API keys required (uses DuckDuckGo HTML)
- Respects CORS and rate limits
