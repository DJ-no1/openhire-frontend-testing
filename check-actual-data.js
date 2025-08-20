const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkActualData() {
  console.log("🔍 Checking actual data in interview_artifacts...");

  const { data, error } = await supabase
    .from("interview_artifacts")
    .select("*")
    .limit(3);

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  console.log(`📊 Found ${data?.length || 0} records`);

  if (data && data.length > 0) {
    data.forEach((record, index) => {
      console.log(`\n📋 Record ${index + 1}:`);
      console.log("- ID:", record.id);
      console.log("- Interview ID:", record.interview_id);
      console.log("- Status:", record.status);
      console.log("- Overall Score:", record.overall_score);
      console.log("- Detailed Score Type:", typeof record.detailed_score);
      console.log("- Overall Feedback Type:", typeof record.overall_feedback);

      // Check detailed_score content
      if (record.detailed_score) {
        console.log("✅ Detailed Score found!");

        let detailedScore;
        if (typeof record.detailed_score === "string") {
          try {
            detailedScore = JSON.parse(record.detailed_score);
            console.log(
              "📝 Parsed detailed score keys:",
              Object.keys(detailedScore)
            );
          } catch (e) {
            console.log("❌ Failed to parse detailed score:", e.message);
            console.log(
              "📝 Raw preview:",
              record.detailed_score.substring(0, 200)
            );
          }
        } else if (typeof record.detailed_score === "object") {
          detailedScore = record.detailed_score;
          console.log("📝 Detailed score keys:", Object.keys(detailedScore));
        }

        // Show some sample scores if they exist
        if (detailedScore) {
          console.log("🎯 Sample values:");
          Object.entries(detailedScore)
            .slice(0, 5)
            .forEach(([key, value]) => {
              console.log(`  - ${key}: ${value}`);
            });
        }
      }

      // Check conversation data
      if (record.conversation) {
        console.log(
          "💬 Conversation data exists, type:",
          typeof record.conversation
        );
        if (typeof record.conversation === "string") {
          try {
            const conv = JSON.parse(record.conversation);
            console.log(
              "📝 Conversation length:",
              Array.isArray(conv) ? conv.length : "not array"
            );
          } catch (e) {
            console.log("❌ Failed to parse conversation");
          }
        }
      }
    });
  }
}

checkActualData().catch(console.error);
