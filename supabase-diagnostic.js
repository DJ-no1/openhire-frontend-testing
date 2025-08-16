// Simple Supabase connection test - Run this in browser console
// Copy and paste this code in your browser console while on the page

console.log("🧪 Running Supabase Diagnostics...");

// Check environment variables
console.log("📋 Environment Check:");
console.log(
  "- NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
console.log(
  "- NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "SET (length: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")"
    : "MISSING"
);

// Test network connectivity to Supabase
async function testSupabaseConnectivity() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    console.error("❌ Supabase URL is missing");
    return;
  }

  try {
    console.log("🌐 Testing network connectivity to:", url);
    const response = await fetch(url + "/rest/v1/", {
      method: "HEAD",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    });

    console.log("✅ Network response status:", response.status);
    console.log(
      "✅ Network response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.status === 200 || response.status === 405) {
      console.log("✅ Supabase endpoint is reachable");
    } else {
      console.error("❌ Unexpected response status:", response.status);
    }
  } catch (error) {
    console.error("❌ Network connectivity failed:", error);
  }
}

// Test Supabase client initialization
async function testSupabaseClient() {
  try {
    console.log("🔧 Testing Supabase client...");
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log("✅ Supabase client created successfully");

    // Try a simple query
    console.log("📊 Testing simple query...");
    const { data, error } = await supabase
      .from("interviews")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Query failed:", error);
    } else {
      console.log("✅ Query successful:", data);
    }
  } catch (error) {
    console.error("❌ Supabase client test failed:", error);
  }
}

// Run all tests
(async () => {
  await testSupabaseConnectivity();
  await testSupabaseClient();
  console.log("🎯 Diagnostics complete!");
})();
