import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId, confirmDeletion } = await req.json();

    // Verify the user is deleting their own data
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Não autorizado a deletar dados de outro usuário" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!confirmDeletion) {
      return new Response(
        JSON.stringify({ error: "Confirmação de deleção necessária" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for deletions
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get all children IDs for this user
    const { data: children } = await supabaseAdmin
      .from("children")
      .select("id")
      .eq("parent_id", userId);

    const childIds = children?.map(c => c.id) || [];

    // Delete in order respecting foreign key constraints
    // 1. Delete child-related data first
    if (childIds.length > 0) {
      await supabaseAdmin.from("emotional_checkins").delete().in("child_id", childIds);
      await supabaseAdmin.from("game_sessions").delete().in("child_id", childIds);
      await supabaseAdmin.from("biofeedback_readings").delete().in("child_id", childIds);
      await supabaseAdmin.from("biofeedback_alerts").delete().in("child_id", childIds);
      await supabaseAdmin.from("ai_content_recommendations").delete().in("child_id", childIds);
      await supabaseAdmin.from("ai_emotional_analysis").delete().in("child_id", childIds);
      await supabaseAdmin.from("abandonment_alerts").delete().in("child_id", childIds);
      await supabaseAdmin.from("avatar_emotional_states").delete().in("child_id", childIds);
      await supabaseAdmin.from("child_avatar_items").delete().in("child_id", childIds);
      await supabaseAdmin.from("child_access").delete().in("child_id", childIds);
      await supabaseAdmin.from("class_students").delete().in("child_id", childIds);
      await supabaseAdmin.from("clinical_pattern_alerts").delete().in("child_id", childIds);
      await supabaseAdmin.from("clinical_outcomes").delete().in("child_id", childIds);
      await supabaseAdmin.from("condensed_assessments").delete().in("child_id", childIds);
      await supabaseAdmin.from("pei_plans").delete().in("child_id", childIds);
      await supabaseAdmin.from("screenings").delete().in("child_id", childIds);
      await supabaseAdmin.from("queue_items").delete().in("child_id", childIds);
    }

    // 2. Delete user-related data
    await supabaseAdmin.from("learning_sessions").delete().eq("user_id", userId);
    await supabaseAdmin.from("emotional_checkins").delete().eq("user_id", userId);
    await supabaseAdmin.from("chat_messages").delete().in(
      "conversation_id",
      (await supabaseAdmin.from("chat_conversations").select("id").eq("user_id", userId)).data?.map(c => c.id) || []
    );
    await supabaseAdmin.from("chat_conversations").delete().eq("user_id", userId);
    await supabaseAdmin.from("behavioral_insights").delete().eq("user_id", userId);
    await supabaseAdmin.from("data_consents").delete().eq("user_id", userId);
    await supabaseAdmin.from("parent_training_progress").delete().eq("user_id", userId);
    await supabaseAdmin.from("community_posts").delete().eq("user_id", userId);
    await supabaseAdmin.from("community_comments").delete().eq("user_id", userId);
    await supabaseAdmin.from("community_likes").delete().eq("user_id", userId);
    await supabaseAdmin.from("community_points").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_mission_progress").delete().eq("user_id", userId);
    await supabaseAdmin.from("notification_preferences").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_achievements").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    await supabaseAdmin.from("audit_logs").delete().eq("user_id", userId);
    await supabaseAdmin.from("clinical_audit_logs").delete().eq("user_id", userId);

    // 3. Delete children
    await supabaseAdmin.from("children").delete().eq("parent_id", userId);

    // 4. Delete profile
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 5. Delete auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      // Continue anyway - data is already deleted
    }

    // Log the deletion for compliance
    await supabaseAdmin.from("audit_logs").insert({
      user_id: null, // User no longer exists
      action: "LGPD_DATA_DELETION",
      resource_type: "user_account",
      resource_id: userId,
      ip_address: req.headers.get("x-forwarded-for") || "unknown"
    });

    return new Response(
      JSON.stringify({ success: true, message: "Conta e dados deletados com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Delete user data error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar solicitação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
