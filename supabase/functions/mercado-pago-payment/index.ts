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

    const { action, ...params } = await req.json();
    console.log(`Processing action: ${action}`, params);

    switch (action) {
      case 'create_preference': {
        // Create a payment preference (checkout link)
        const { planId, userId, billingCycle, returnUrl } = params;

        // Get plan details
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();

        if (planError || !plan) {
          throw new Error('Plan not found');
        }

        const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
        const description = `${plan.name} - ${billingCycle === 'yearly' ? 'Anual' : 'Mensal'}`;

        // Create preference in Mercado Pago
        const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              {
                id: planId,
                title: plan.name,
                description: description,
                quantity: 1,
                currency_id: 'BRL',
                unit_price: Number(price),
              }
            ],
            payer: {
              email: params.email || undefined,
            },
            back_urls: {
              success: `${returnUrl}?status=success&plan=${planId}`,
              failure: `${returnUrl}?status=failure`,
              pending: `${returnUrl}?status=pending`,
            },
            auto_return: 'approved',
            external_reference: JSON.stringify({ userId, planId, billingCycle }),
            notification_url: `${supabaseUrl}/functions/v1/mercado-pago-webhook`,
          }),
        });

        const preference = await preferenceResponse.json();
        console.log('Preference created:', preference.id);

        if (!preferenceResponse.ok) {
          console.error('Mercado Pago error:', preference);
          throw new Error(preference.message || 'Error creating preference');
        }

        return new Response(
          JSON.stringify({
            preferenceId: preference.id,
            initPoint: preference.init_point,
            sandboxInitPoint: preference.sandbox_init_point,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_subscription': {
        // Create a recurring subscription
        const { planId, userId, billingCycle, email, cardToken } = params;

        // Get plan details
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();

        if (planError || !plan) {
          throw new Error('Plan not found');
        }

        const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

        // Create subscription plan in MP if needed
        const subscriptionResponse = await fetch('https://api.mercadopago.com/preapproval', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: `Assinatura ${plan.name}`,
            auto_recurring: {
              frequency: billingCycle === 'yearly' ? 12 : 1,
              frequency_type: 'months',
              transaction_amount: Number(price),
              currency_id: 'BRL',
            },
            back_url: params.returnUrl,
            payer_email: email,
            external_reference: JSON.stringify({ userId, planId, billingCycle }),
          }),
        });

        const subscription = await subscriptionResponse.json();
        console.log('Subscription created:', subscription.id);

        if (!subscriptionResponse.ok) {
          console.error('Mercado Pago subscription error:', subscription);
          throw new Error(subscription.message || 'Error creating subscription');
        }

        return new Response(
          JSON.stringify({
            subscriptionId: subscription.id,
            initPoint: subscription.init_point,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_payment': {
        // Get payment status
        const { paymentId } = params;

        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const payment = await paymentResponse.json();
        console.log('Payment status:', payment.status);

        return new Response(
          JSON.stringify(payment),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in mercado-pago-payment:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
