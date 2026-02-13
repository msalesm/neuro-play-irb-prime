import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Check rate limit for a user on a specific endpoint.
 * Returns true if allowed, false if rate limited.
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number = 10,
  windowMinutes: number = 60
): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_max_requests: maxRequests,
    p_window_minutes: windowMinutes,
  });

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if rate limit check fails
    return true;
  }

  return data === true;
}

export const rateLimitHeaders = {
  'Content-Type': 'application/json',
};

export function rateLimitResponse(corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
    {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
