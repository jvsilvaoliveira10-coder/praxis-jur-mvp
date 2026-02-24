import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function testD4Sign(apiKey: string, environment: string): Promise<{ success: boolean; message: string }> {
  const baseUrl = environment === 'production'
    ? 'https://secure.d4sign.com.br/api/v1'
    : 'https://sandbox.d4sign.com.br/api/v1';

  try {
    const response = await fetch(`${baseUrl}/safes?tokenAPI=${apiKey}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      return { success: true, message: 'Conexão com D4Sign verificada com sucesso!' };
    }

    const errorText = await response.text();
    return { success: false, message: `Erro D4Sign (${response.status}): ${errorText}` };
  } catch (error: any) {
    return { success: false, message: `Erro de conexão com D4Sign: ${error.message}` };
  }
}

async function testDocuSign(apiKey: string, environment: string): Promise<{ success: boolean; message: string }> {
  const baseUrl = environment === 'production'
    ? 'https://account.docusign.com'
    : 'https://account-d.docusign.com';

  try {
    const response = await fetch(`${baseUrl}/oauth/userinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { success: true, message: 'Conexão com DocuSign verificada com sucesso!' };
    }

    return { success: false, message: `Erro DocuSign (${response.status}): Token inválido ou expirado` };
  } catch (error: any) {
    return { success: false, message: `Erro de conexão com DocuSign: ${error.message}` };
  }
}

async function testClicksign(apiKey: string, environment: string): Promise<{ success: boolean; message: string }> {
  const baseUrl = environment === 'production'
    ? 'https://app.clicksign.com/api/v1'
    : 'https://sandbox.clicksign.com/api/v1';

  try {
    const response = await fetch(`${baseUrl}/documents?access_token=${apiKey}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      return { success: true, message: 'Conexão com Clicksign verificada com sucesso!' };
    }

    return { success: false, message: `Erro Clicksign (${response.status}): Token inválido` };
  } catch (error: any) {
    return { success: false, message: `Erro de conexão com Clicksign: ${error.message}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { provider, api_key, api_secret, environment } = await req.json();

    if (!provider || !api_key) {
      return new Response(JSON.stringify({ error: 'provider e api_key são obrigatórios' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let result: { success: boolean; message: string };

    switch (provider) {
      case 'd4sign':
        result = await testD4Sign(api_key, environment || 'sandbox');
        break;
      case 'docusign':
        result = await testDocuSign(api_key, environment || 'sandbox');
        break;
      case 'clicksign':
        result = await testClicksign(api_key, environment || 'sandbox');
        break;
      default:
        result = { success: false, message: `Provedor "${provider}" não suportado` };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
