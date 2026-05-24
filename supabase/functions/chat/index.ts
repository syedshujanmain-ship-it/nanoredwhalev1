// supabase/functions/chat/index.ts - OpenRouter API Integration
// CRITICAL UPDATE: Using OpenRouter API for chat completions
// Server-side implementation to bypass CORS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, X-Customer-Auth",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Health Check
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({ ok: true, message: "OpenRouter Chat Proxy is active" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Parse request body
    let body: any = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
      console.error("JSON Parse error:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { contents } = body;

    // Get API key from environment
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!contents || !Array.isArray(contents)) {
      return new Response(
        JSON.stringify({ error: "contents array required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Extract the latest user message
    const lastUserMessage = contents.filter((msg: any) => msg.role === 'user').pop();
    const userPrompt = lastUserMessage?.parts?.[0]?.text || "Hello";

    console.log(`Calling OpenRouter API with message: "${userPrompt.substring(0, 50)}..."`);

    // Call OpenRouter API with EXACT specifications
    // Endpoint: https://openrouter.ai/api/v1/chat/completions
    // Method: POST
    // Headers: Authorization, Content-Type, HTTP-Referer (mandatory for free models), X-Title
    // Body: {"model": "meta-llama/llama-3.1-8b-instruct", "messages": [{"role": "user", "content": "user_input"}]}
    let apiResponse;
    try {
      apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://medo.dev",
          "X-Title": "My Red Whale App"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: [
            {
              role: "user",
              content: userPrompt
            }
          ]
        })
      });
    } catch (fetchError: any) {
      console.error("Network Error calling OpenRouter API:", fetchError.message);
      return new Response(
        JSON.stringify({ 
          error: "Network Error", 
          message: "Failed to reach OpenRouter API",
          details: fetchError.message 
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error("OpenRouter API Error:", apiResponse.status, errorData);
      return new Response(
        JSON.stringify({ 
          error: "OpenRouter API error", 
          message: "Unable to get response from AI",
          details: errorData 
        }),
        { status: apiResponse.status, headers: corsHeaders }
      );
    }

    const data = await apiResponse.json();
    console.log("OpenRouter response received");
    
    // Extract AI response from choices[0].message.content (OpenRouter format)
    const aiContent = data.choices?.[0]?.message?.content || "No response received";
    
    // Format response for frontend (Gemini-compatible format)
    const encoder = new TextEncoder();
    const geminiFormat = {
      candidates: [{ content: { role: "model", parts: [{ text: aiContent }] } }]
    };
    
    // Simulate streaming response (frontend expects SSE format)
    const streamContent = `data: ${JSON.stringify(geminiFormat)}\n\ndata: [DONE]\n\n`;
    
    return new Response(encoder.encode(streamContent), { 
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream", 
        "Cache-Control": "no-cache" 
      } 
    });

  } catch (error: any) {
    console.error("Internal Server Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
