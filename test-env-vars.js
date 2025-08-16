// Test environment variables loading
// Run this in the browser console to verify env vars are loaded

console.log("🧪 Environment Variables Test:");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "SET (length: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")"
    : "MISSING"
);

// Test if variables are undefined vs empty string
if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is undefined");
}
if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === undefined) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined");
}

console.log("✅ Environment test complete");
