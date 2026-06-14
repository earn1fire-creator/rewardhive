import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * CPAlead Postback Handler
 *
 * This Edge Function receives postback notifications from CPAlead when users complete offers.
 * It processes the postback, validates the data, prevents duplicates, and updates user points.
 *
 * Expected CPAlead Postback Parameters:
 * - subid: The user ID passed to the offerwall
 * - amount: Points/cents earned (we multiply by 1 for points, or interpret as USD cents)
 * - transaction_id: Unique transaction identifier from CPAlead
 * - campaign_id: Optional - The campaign ID
 * - campaign_name: Optional - The campaign name
 * - payout: Optional - Publisher payout amount
 *
 * Security:
 * - IP validation (optional - can whitelist CPAlead IPs)
 * - Duplicate prevention via transaction_id
 * - User existence validation
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// CPAlead IP whitelist for production security
// Contact CPAlead support to get their current postback IPs
const CPALEAD_IPS = [
  // Add CPAlead's postback server IPs here when known
  // Example: '104.20.0.0', '104.21.0.0'
];

// Helper to get real IP from request
function getClientIP(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || null;
}

// Validate UUID format
function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// Get Supabase client (using service role for full access)
async function getSupabaseClient() {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const startTime = Date.now();
  const clientIP = getClientIP(req);

  // Log incoming request
  console.log(`[CPAlead Postback] ${new Date().toISOString()} - IP: ${clientIP || 'unknown'}`);

  try {
    // Parse request - handle both GET and POST
    let params: Record<string, string> = {};

    if (req.method === "GET") {
      const url = new URL(req.url);
      params = Object.fromEntries(url.searchParams.entries());
    } else if (req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/x-www-form-urlencoded")) {
        const formData = await req.formData();
        params = Object.fromEntries(formData.entries() as Iterable<[string, string]>);
      } else if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        params = Object.fromEntries(formData.entries() as Iterable<[string, string]>);
      } else {
        const body = await req.text();
        // Try to parse as JSON
        try {
          const json = JSON.parse(body);
          params = typeof json === "object" ? json : {};
        } catch {
          // Try to parse as query string
          const urlParams = new URLSearchParams(body);
          params = Object.fromEntries(urlParams.entries());
        }
      }
    } else {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Raw payload for logging
    const rawPayload = new URLSearchParams(params).toString();

    console.log(`[CPAlead Postback] Raw params:`, rawPayload);

    // Extract required parameters
    // CPAlead uses different parameter names depending on configuration
    const subid = params.subid || params.sub_id || params.subId || params.userid || params.user_id;
    const amountStr = params.amount || params.points || params.reward || params.payout;
    const transactionId = params.transaction_id || params.trans_id || params.txid || params.id || params.offer_id || params.offerid;

    // Additional tracking (optional)
    const campaignId = params.campaign_id || params.camp_id;
    const campaignName = params.campaign_name || params.camp_name;

    // Validate required fields
    if (!subid) {
      console.error(`[CPAlead Postback] Missing subid - params:`, params);
      return new Response(JSON.stringify({
        success: false,
        error: "Missing subid parameter"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!isValidUUID(subid)) {
      console.error(`[CPAlead Postback] Invalid UUID: ${subid}`);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid user ID format"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse amount (CPAlead may send dollars or cents)
    let amount = parseFloat(amountStr) || 0;

    if (amount <= 0) {
      console.error(`[CPAlead Postback] Invalid amount: ${amountStr}`);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid amount"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Generate transaction ID if not provided (useful for tracking)
    const finalTransactionId = transactionId || `cpalead_${Date.now()}_${subid.substring(0, 8)}`;

    console.log(`[CPAlead Postback] Processing: user=${subid}, amount=${amount}, txid=${finalTransactionId}`);

    // Get Supabase client
    const supabase = await getSupabaseClient();

    // Call the atomic postback processing function
    const { data, error } = await supabase.rpc("process_cpalead_postback", {
      p_transaction_id: finalTransactionId,
      p_user_id: subid,
      p_amount: amount,
      p_ip_address: clientIP,
      p_raw_payload: rawPayload
    });

    if (error) {
      console.error(`[CPAlead Postback] RPC error:`, error);
      return new Response(JSON.stringify({
        success: false,
        error: "Database error",
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const result = data as Record<string, unknown>;
    const processingTime = Date.now() - startTime;

    if (result.success) {
      console.log(`[CPAlead Postback] SUCCESS: ${result.message || 'Processed'} - user=${subid}, points=+${result.points_earned}, time=${processingTime}ms`);

      // Return success response with debug info
      return new Response(JSON.stringify({
        success: true,
        status: result.status,
        message: "Postback processed successfully",
        user_id: subid,
        points_earned: result.points_earned,
        new_balance: result.new_balance,
        processing_time_ms: processingTime
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else {
      console.log(`[CPAlead Postback] DUPLICATE/INVALID: ${result.status} - user=${subid}, txid=${finalTransactionId}`);

      return new Response(JSON.stringify({
        success: false,
        status: result.status,
        message: result.message || "Postback not processed",
        processing_time_ms: processingTime
      }), {
        status: 200, // Return 200 so CPAlead doesn't retry
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error(`[CPAlead Postback] ERROR:`, error);

    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
