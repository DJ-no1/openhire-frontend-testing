const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDataMapping() {
  console.log("🧪 Testing data mapping for interview results...");

  // Get the latest interview artifact
  const { data: artifacts, error } = await supabase
    .from("interview_artifacts")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  if (!artifacts || artifacts.length === 0) {
    console.log("📭 No artifacts found");
    return;
  }

  const artifact = artifacts[0];
  console.log("📊 Raw artifact ID:", artifact.id);
  console.log("📊 Has detailed_score:", !!artifact.detailed_score);

  // Simulate the mapping logic from the frontend
  if (artifact.detailed_score) {
    const mapped_ai_assessment = {
      // Keep the original universal_scores structure for the chart
      universal_scores: artifact.detailed_score.universal_scores || {
        teamwork_score: 0,
        adaptability_score: 0,
        cultural_fit_score: 0,
        communication_score: 0,
        problem_solving_score: 0,
        leadership_potential_score: 0,
      },

      // Industry competency scores
      industry_competency_scores:
        artifact.detailed_score.industry_competency_scores || {},

      // Other scores
      overall_score:
        artifact.detailed_score.overall_score || artifact.overall_score || 0,
      technical_score: artifact.detailed_score.technical_score || 0,

      // Recommendation
      overall_recommendation:
        artifact.detailed_score.final_recommendation || "no_data",

      // Industry type
      industry_type: artifact.detailed_score.industry_type || "Unknown",
    };

    console.log("✅ Mapped ai_assessment structure:");
    console.log(
      "📊 Universal scores:",
      JSON.stringify(mapped_ai_assessment.universal_scores, null, 2)
    );
    console.log(
      "📊 Industry competency:",
      JSON.stringify(mapped_ai_assessment.industry_competency_scores, null, 2)
    );
    console.log("📊 Overall score:", mapped_ai_assessment.overall_score);
    console.log(
      "📊 Recommendation:",
      mapped_ai_assessment.overall_recommendation
    );
    console.log("📊 Industry type:", mapped_ai_assessment.industry_type);

    // Check if universal_scores has valid data
    const hasValidUniversalScores = Object.values(
      mapped_ai_assessment.universal_scores
    ).some((score) => score > 0);
    console.log("🎯 Has valid universal scores:", hasValidUniversalScores);

    // Check if industry_competency has valid data
    const hasValidIndustryScores = Object.values(
      mapped_ai_assessment.industry_competency_scores
    ).some((score) => score > 0);
    console.log("🎯 Has valid industry scores:", hasValidIndustryScores);
  }
}

testDataMapping().catch(console.error);
