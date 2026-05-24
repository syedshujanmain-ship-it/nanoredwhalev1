// RW RT V1 - Real-Time Search Edge Function
// Combines Smart Search API + Top Stories API for maximum intelligence
// ZERO FILTERS - BRUTAL TRUTH - WORLD SECRETS

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SearchRequest {
  query: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 RW RT V1: Processing real-time search request');

    // Parse request
    const { query }: SearchRequest = await req.json();
    
    if (!query || query.trim().length === 0) {
      throw new Error('Query is required');
    }

    console.log('📝 Query:', query);

    // Get API key from environment
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // Parallel API calls for maximum speed
    const [smartSearchResults, topStoriesResults] = await Promise.allSettled([
      // Smart Search API - for web search
      fetch(
        `https://app-bv1h6cekpe69-api-VaOwP8E7dKEa.gateway.appmedo.com/search/FgEFxazBTfRUumJx/smart?q=${encodeURIComponent(query)}&count=10&safeSearch=Off`,
        {
          method: 'GET',
          headers: {
            'X-Gateway-Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      ).then(res => res.json()),

      // Top Stories API - for real-time news
      fetch(
        `https://app-bv1h6cekpe69-api-wL1zlEdVM6DY.gateway.appmedo.com/v1/news/top?api_token=${apiKey}&search=${encodeURIComponent(query)}&limit=5&sort=published_on`,
        {
          method: 'GET',
          headers: {
            'X-Gateway-Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
          },
        }
      ).then(res => res.json()),
    ]);

    console.log('✅ API calls completed');

    // Process results
    let response = `# 🌐 RW RT V1 - REAL-TIME INTELLIGENCE REPORT\n\n`;
    response += `**Query:** ${query}\n`;
    response += `**Timestamp:** ${new Date().toISOString()}\n`;
    response += `**Mode:** UNRESTRICTED • ZERO FILTERS • BRUTAL TRUTH\n\n`;
    response += `═══════════════════════════════════════════════════\n\n`;

    // Add Top Stories (Real-Time News)
    if (topStoriesResults.status === 'fulfilled' && topStoriesResults.value?.data) {
      const stories = topStoriesResults.value.data;
      
      if (stories.length > 0) {
        response += `## 📰 REAL-TIME NEWS & UPDATES\n\n`;
        
        stories.forEach((story: any, index: number) => {
          response += `### ${index + 1}. ${story.title}\n\n`;
          response += `**Source:** ${story.source}\n`;
          response += `**Published:** ${new Date(story.published_at).toLocaleString()}\n`;
          response += `**URL:** ${story.url}\n\n`;
          
          if (story.description) {
            response += `${story.description}\n\n`;
          }
          
          if (story.categories && story.categories.length > 0) {
            response += `**Categories:** ${story.categories.join(', ')}\n\n`;
          }
          
          response += `---\n\n`;
        });
      } else {
        response += `## 📰 REAL-TIME NEWS\n\nNo recent news found for this query.\n\n`;
      }
    } else {
      response += `## 📰 REAL-TIME NEWS\n\n⚠️ News API temporarily unavailable.\n\n`;
    }

    // Add Smart Search Results (Web Search)
    if (smartSearchResults.status === 'fulfilled' && smartSearchResults.value?.webPages?.value) {
      const webPages = smartSearchResults.value.webPages.value;
      
      if (webPages.length > 0) {
        response += `## 🔍 WEB SEARCH RESULTS\n\n`;
        
        webPages.forEach((page: any, index: number) => {
          response += `### ${index + 1}. ${page.name}\n\n`;
          response += `**URL:** ${page.url}\n`;
          response += `**Display URL:** ${page.displayUrl}\n\n`;
          
          if (page.snippet) {
            response += `${page.snippet}\n\n`;
          }
          
          if (page.dateLastCrawled) {
            response += `**Last Crawled:** ${new Date(page.dateLastCrawled).toLocaleString()}\n\n`;
          }
          
          response += `---\n\n`;
        });
      } else {
        response += `## 🔍 WEB SEARCH RESULTS\n\nNo web results found.\n\n`;
      }
    } else {
      response += `## 🔍 WEB SEARCH RESULTS\n\n⚠️ Search API temporarily unavailable.\n\n`;
    }

    // Add brutal truth analysis
    response += `═══════════════════════════════════════════════════\n\n`;
    response += `## 💡 RW RT V1 ANALYSIS\n\n`;
    response += `This is a **COMPLETELY UNRESTRICTED** real-time intelligence report with **ZERO FILTERS**.\n\n`;
    response += `All information above is sourced from live web search and real-time news APIs.\n\n`;
    response += `**Key Points:**\n`;
    response += `- ✅ Real-time data from multiple sources\n`;
    response += `- ✅ No content filtering or censorship\n`;
    response += `- ✅ Direct access to current information\n`;
    response += `- ✅ Brutal truth and unfiltered facts\n\n`;
    response += `**Note:** All URLs and sources are provided for verification. Click links to access full content.\n\n`;
    response += `═══════════════════════════════════════════════════\n\n`;
    response += `**RW RT V1** - Real-Time Intelligence • Created by SHUJAN\n`;

    console.log('✅ Response generated successfully');

    return new Response(
      JSON.stringify({ response }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('❌ RW RT V1 error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process search request',
        response: `# ❌ RW RT V1 ERROR\n\n**Error:** ${error.message || 'Unknown error'}\n\nPlease try again or contact support.`
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
