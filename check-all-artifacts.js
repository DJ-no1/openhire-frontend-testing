const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAllArtifacts() {
  console.log("🔍 Checking all interview artifacts for high-scoring data...");

  // Get all interview artifacts
  const { data: artifacts, error } = await supabase
    .from("interview_artifacts")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  console.log(`📊 Found ${artifacts.length} total artifacts`);

  artifacts.forEach((artifact, index) => {
    console.log(`\n📋 Artifact ${index + 1}:`);
    console.log("- ID:", artifact.id);
    console.log("- Timestamp:", artifact.timestamp);
    console.log("- Status:", artifact.status);
    console.log("- Overall Score:", artifact.overall_score);

    if (artifact.detailed_score?.universal_scores) {
      const universal = artifact.detailed_score.universal_scores;
      const avgScore =
        (universal.teamwork_score +
          universal.adaptability_score +
          universal.cultural_fit_score +
          universal.communication_score +
          universal.problem_solving_score +
          universal.leadership_potential_score) /
        6;

      console.log("- Universal Scores:", universal);
      console.log("- Average Universal Score:", avgScore.toFixed(1));
      console.log("- Industry Type:", artifact.detailed_score.industry_type);
      console.log(
        "- Final Recommendation:",
        artifact.detailed_score.final_recommendation
      );

      // Check if this matches the screenshot data (79.2 average)
      if (avgScore > 70) {
        console.log(
          "🎯 HIGH SCORING ARTIFACT FOUND! This might be the one from the screenshot."
        );
      }
    }
  });
}

checkAllArtifacts().catch(console.error);
