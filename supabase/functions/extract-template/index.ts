import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { fileBase64, fileName } = await req.json();

    if (!fileBase64 || !fileName) {
      return new Response(JSON.stringify({ error: 'fileBase64 and fileName are required' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ext = fileName.toLowerCase().split('.').pop();

    if (ext === 'txt') {
      // Decode base64 text directly
      const bytes = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
      const text = new TextDecoder('utf-8').decode(bytes);
      return new Response(JSON.stringify({ html: text, text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (ext === 'docx') {
      // Use mammoth to extract HTML from DOCX
      const mammoth = await import("https://esm.sh/mammoth@1.8.0");
      
      const bytes = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
      const arrayBuffer = bytes.buffer;

      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      // Also get raw text
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      const text = textResult.value;

      console.log(`Extracted ${html.length} chars HTML, ${text.length} chars text from ${fileName}`);

      return new Response(JSON.stringify({ html, text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Formato .${ext} não suportado. Use .docx ou .txt` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("extract-template error:", error);
    return new Response(JSON.stringify({ error: "Erro ao extrair conteúdo do arquivo" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
