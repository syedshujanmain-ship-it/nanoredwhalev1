// Edge Function for Real-Time Web Search - Fetches actual live data from the internet
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  timestamp: string;
  success: boolean;
}

/**
 * Fetch real-time search results from DuckDuckGo
 */
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    // Use DuckDuckGo HTML version for scraping
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.error('DuckDuckGo search failed:', response.status);
      return [];
    }

    const html = await response.text();
    
    // Parse HTML to extract search results
    const results: SearchResult[] = [];
    
    // Simple regex-based parsing for DuckDuckGo results
    // Look for result links and snippets
    const resultPattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const snippetPattern = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/g;
    
    let match;
    let count = 0;
    const maxResults = 5;
    
    // Extract titles and URLs
    const titleMatches: Array<{ url: string; title: string }> = [];
    while ((match = resultPattern.exec(html)) !== null && count < maxResults) {
      const url = match[1];
      const title = match[2].trim();
      if (url && title && !url.includes('duckduckgo.com')) {
        titleMatches.push({ url, title });
        count++;
      }
    }
    
    // Extract snippets
    const snippets: string[] = [];
    count = 0;
    while ((match = snippetPattern.exec(html)) !== null && count < maxResults) {
      const snippet = match[1].trim();
      if (snippet) {
        snippets.push(snippet);
        count++;
      }
    }
    
    // Combine titles, URLs, and snippets
    for (let i = 0; i < Math.min(titleMatches.length, maxResults); i++) {
      results.push({
        title: titleMatches[i].title,
        url: titleMatches[i].url,
        snippet: snippets[i] || 'No description available',
      });
    }
    
    // If regex parsing fails, try alternative method
    if (results.length === 0) {
      // Fallback: extract any useful text content
      const textPattern = /<div[^>]+class="result__body"[^>]*>([\s\S]*?)<\/div>/g;
      while ((match = textPattern.exec(html)) !== null && results.length < 3) {
        const content = match[1].replace(/<[^>]+>/g, ' ').trim();
        if (content.length > 50) {
          results.push({
            title: 'Search Result',
            url: 'https://duckduckgo.com',
            snippet: content.substring(0, 200),
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error searching DuckDuckGo:', error);
    return [];
  }
}

/**
 * Fetch current date and time information
 */
function getCurrentDateTime(): string {
  const now = new Date();
  return now.toISOString();
}

/**
 * Fetch real-time data from multiple sources
 */
async function fetchRealTimeData(query: string): Promise<WebSearchResponse> {
  const timestamp = getCurrentDateTime();
  
  // Perform web search
  const searchResults = await searchDuckDuckGo(query);
  
  return {
    query,
    results: searchResults,
    timestamp,
    success: searchResults.length > 0,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch real-time data
    const data = await fetchRealTimeData(query);

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in web-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch real-time data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
