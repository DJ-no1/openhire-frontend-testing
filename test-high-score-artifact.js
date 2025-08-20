require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testHighScoreArtifact() {
  console.log("🔍 Testing high-scoring artifact data mapping...");

  // Use one of the high-scoring artifacts we found
  const highScoreArtifactId = "a195c21b-2e06-4a41-b5d2-602f37492ee7"; // 89.2 average score

  try {
    const { data: artifact, error } = await supabase
      .from("interview_artifacts")
      .select("*")
      .eq("id", highScoreArtifactId)
      .single();

    if (error) {
      console.error("❌ Error fetching artifact:", error);
      return;
    }

    console.log("📊 Found high-score artifact:");
    console.log("- ID:", artifact.id);
    console.log("- Timestamp:", artifact.timestamp);
    console.log("- Overall Score:", artifact.overall_score);
    console.log("- Status:", artifact.status);

    if (artifact.detailed_score && artifact.detailed_score.universal_scores) {
      const scores = artifact.detailed_score.universal_scores;
      console.log("📈 Universal Scores:");
      console.log("  Teamwork:", scores.teamwork_score);
      console.log("  Adaptability:", scores.adaptability_score);
      console.log("  Cultural Fit:", scores.cultural_fit_score);
      console.log("  Communication:", scores.communication_score);
      console.log("  Problem Solving:", scores.problem_solving_score);
      console.log("  Leadership:", scores.leadership_potential_score);

      const average =
        Object.values(scores).reduce((sum, score) => sum + score, 0) /
        Object.values(scores).length;
      console.log("📊 Average Score:", average.toFixed(1));

      // Test the data mapping that the UI uses
      const ai_assessment = {
        universal_scores: scores,
        overall_score:
          artifact.detailed_score.overall_score || artifact.overall_score || 0,
        industry_competency_scores:
          artifact.detailed_score.industry_competency_scores || {},
        overall_recommendation:
          artifact.detailed_score.final_recommendation || "no_data",
        industry_type: artifact.detailed_score.industry_type || "Unknown",
      };

      console.log("\n✅ Mapped AI Assessment:");
      console.log("- Universal Scores:", ai_assessment.universal_scores);
      console.log("- Overall Score:", ai_assessment.overall_score);
      console.log("- Industry Type:", ai_assessment.industry_type);
      console.log("- Recommendation:", ai_assessment.overall_recommendation);

      // Check if this would trigger the "Assessment data not available" condition
      const averageScore =
        Object.values(ai_assessment.universal_scores).reduce(
          (sum, score) => sum + score,
          0
        ) / Object.values(ai_assessment.universal_scores).length;
      console.log("\n🎯 Chart Display Test:");
      console.log("- Average Score:", averageScore);
      console.log(
        '- Would show "Assessment data not available"?',
        averageScore === 0 ? "YES" : "NO"
      );
      console.log(
        "- Chart should display:",
        averageScore > 0 ? "RADAR CHART" : "EMPTY STATE"
      );
    } else {
      console.log("❌ No detailed_score.universal_scores found");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testHighScoreArtifact();
