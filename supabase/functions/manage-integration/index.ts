import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function encryptValue(value: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(key.padEnd(32, '0').slice(0, 32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'AES-GCM' }, false, ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, cryptoKey, enc.encode(value)
  );
  
  // Combine iv + ciphertext, encode as base64
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return base64Encode(combined);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Validate user JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const encryptionKey = Deno.env.get('INTEGRATIONS_ENCRYPTION_KEY');
    if (!encryptionKey) {
      return new Response(JSON.stringify({ error: 'Encryption key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, provider, api_key, api_secret, environment, integration_id } = await req.json();

    if (action === 'save') {
      if (!provider || !api_key) {
        return new Response(JSON.stringify({ error: 'provider and api_key are required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const encryptedKey = await encryptValue(api_key, encryptionKey);
      const encryptedSecret = api_secret ? await encryptValue(api_secret, encryptionKey) : null;

      if (integration_id) {
        // Update existing - verify ownership
        const { data: existing } = await supabaseAdmin
          .from('user_integrations')
          .select('user_id')
          .eq('id', integration_id)
          .single();

        if (!existing || existing.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const updatePayload: Record<string, unknown> = {
          environment: environment || 'sandbox',
          api_key_encrypted: encryptedKey,
        };
        if (encryptedSecret !== null) {
          updatePayload.api_secret_encrypted = encryptedSecret;
        }

        const { error } = await supabaseAdmin
          .from('user_integrations')
          .update(updatePayload)
          .eq('id', integration_id);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else {
        // Insert new
        const { error } = await supabaseAdmin
          .from('user_integrations')
          .insert({
            user_id: user.id,
            provider,
            api_key_encrypted: encryptedKey,
            api_secret_encrypted: encryptedSecret,
            environment: environment || 'sandbox',
            is_active: true,
          });

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
