const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDetailedScores() {
  console.log("🔍 Checking universal_scores structure...");

  const { data, error } = await supabase
    .from("interview_artifacts")
    .select("detailed_score, conversation")
    .limit(1);

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  if (data && data.length > 0) {
    const record = data[0];
    const detailedScore = record.detailed_score;

    console.log("\n📊 Universal Scores:");
    if (detailedScore.universal_scores) {
      console.log(JSON.stringify(detailedScore.universal_scores, null, 2));
    }

    console.log("\n🏭 Industry Competency Scores:");
    if (detailedScore.industry_competency_scores) {
      console.log(
        JSON.stringify(detailedScore.industry_competency_scores, null, 2)
      );
    }

    console.log("\n💡 Final Recommendation:");
    console.log(detailedScore.final_recommendation);

    console.log("\n💬 Conversation Structure:");
    const conversation = record.conversation;
    if (Array.isArray(conversation)) {
      console.log(`- Length: ${conversation.length} messages`);
      if (conversation.length > 0) {
        console.log("- Sample message keys:", Object.keys(conversation[0]));
        console.log(
          "- First message:",
          JSON.stringify(conversation[0], null, 2)
        );
      }
    } else {
      console.log("- Type:", typeof conversation);
    }
  }
}

checkDetailedScores().catch(console.error);
