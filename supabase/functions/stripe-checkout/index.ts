import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe price IDs mapping
const STRIPE_PRICES = {
  pro_family: {
    monthly: "price_1Sc61lGmSkyNzKz8YegvzSjk",
    yearly: "price_1Sc61lGmSkyNzKz8YegvzSjk", // Use same for now, can create yearly price later
    product_id: "prod_TZEUaVojXRO8n5"
  },
  pro_therapist: {
    monthly: "price_1Sc625GmSkyNzKz8dEU0blXb",
    yearly: "price_1Sc625GmSkyNzKz8dEU0blXb",
    product_id: "prod_TZEVsV95EtdA7N"
  },
  institutional: {
    monthly: "price_1Sc62KGmSkyNzKz8HHTqqjGX",
    yearly: "price_1Sc62KGmSkyNzKz8HHTqqjGX",
    product_id: "prod_TZEVCQjCrb7cJy"
  }
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planType, billingCycle = 'monthly' } = await req.json();
    logStep("Request params", { planType, billingCycle });

    const priceConfig = STRIPE_PRICES[planType as keyof typeof STRIPE_PRICES];
    if (!priceConfig) throw new Error(`Invalid plan type: ${planType}`);

    const priceId = billingCycle === 'yearly' ? priceConfig.yearly : priceConfig.monthly;
    logStep("Selected price", { priceId, productId: priceConfig.product_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://preview--neuroplayedu.lovable.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/subscription?success=true`,
      cancel_url: `${origin}/subscription?cancelled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
        billing_cycle: billingCycle
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
