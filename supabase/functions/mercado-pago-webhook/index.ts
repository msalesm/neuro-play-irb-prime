import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      throw new Error('Mercado Pago not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse webhook notification
    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body));

    const { type, data } = body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Fetch payment details from Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const payment = await paymentResponse.json();
      console.log('Payment details:', payment.status, payment.external_reference);

      if (payment.status === 'approved') {
        // Parse external reference
        let externalRef;
        try {
          externalRef = JSON.parse(payment.external_reference);
        } catch {
          console.error('Invalid external_reference:', payment.external_reference);
          return new Response('OK', { headers: corsHeaders });
        }

        const { userId, planId, billingCycle } = externalRef;

        // Calculate period end
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

        // Create or update subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            billing_cycle: billingCycle,
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd.toISOString(),
            payment_provider: 'mercado_pago',
            external_subscription_id: payment.id.toString(),
            external_customer_id: payment.payer?.id?.toString(),
            metadata: {
              last_payment_id: paymentId,
              last_payment_amount: payment.transaction_amount,
              last_payment_date: payment.date_approved,
            },
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (subError) {
          console.error('Error updating subscription:', subError);
        } else {
          console.log('Subscription activated for user:', userId);

          // Create internal notification
          await supabase.from('internal_notifications').insert({
            user_id: userId,
            title: 'Assinatura Ativada!',
            message: 'Seu pagamento foi confirmado e sua assinatura está ativa.',
            type: 'success',
          });
        }
      }
    }

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('OK', { headers: corsHeaders });
  }
});
