const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkInterviewData() {
  console.log("🔍 Checking interview_artifacts table...");

  // First, check if table exists and get structure
  const { data, error } = await supabase
    .from("interview_artifacts")
    .select("*")
    .limit(5);

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  console.log(
    `📊 Found ${data?.length || 0} records in interview_artifacts table`
  );

  if (data && data.length > 0) {
    const sample = data[0];
    console.log("\n📋 First record structure:");
    console.log("- ID:", sample.id);
    console.log("- Application ID:", sample.application_id);
    console.log("- Created:", sample.created_at);
    console.log("- Has AI Assessment:", !!sample.ai_assessment);
    console.log("- AI Assessment Type:", typeof sample.ai_assessment);
    console.log("- Total Questions:", sample.total_questions);
    console.log("- Answered Questions:", sample.answered_questions);
    console.log("- Duration:", sample.duration_minutes);

    // Check AI assessment content
    if (sample.ai_assessment) {
      console.log("\n✅ AI Assessment found!");

      let assessment;
      if (typeof sample.ai_assessment === "string") {
        try {
          assessment = JSON.parse(sample.ai_assessment);
          console.log("📝 Successfully parsed from JSON string");
        } catch (e) {
          console.log("❌ Failed to parse JSON:", e.message);
          console.log(
            "📝 Raw string preview:",
            sample.ai_assessment.substring(0, 200) + "..."
          );
          return;
        }
      } else {
        assessment = sample.ai_assessment;
        console.log("📝 Already an object");
      }

      console.log("\n📊 Assessment Structure:");
      console.log("- Keys:", Object.keys(assessment));

      if (assessment.teamwork_score !== undefined) {
        console.log("\n🎯 Universal Scores:");
        console.log("- Teamwork:", assessment.teamwork_score);
        console.log("- Communication:", assessment.communication_score);
        console.log("- Problem Solving:", assessment.problem_solving_score);
        console.log("- Adaptability:", assessment.adaptability_score);
        console.log("- Cultural Fit:", assessment.cultural_fit_score);
        console.log("- Leadership:", assessment.leadership_potential_score);
      }

      if (assessment.industry_competency) {
        console.log(
          "\n🏭 Industry Competency:",
          assessment.industry_competency
        );
      }

      if (assessment.overall_recommendation) {
        console.log(
          "\n💡 Overall Recommendation:",
          assessment.overall_recommendation
        );
      }
    } else {
      console.log("\n⚠️ No AI Assessment data found");
    }

    // Show all column names
    console.log("\n📝 All columns:", Object.keys(sample));
  } else {
    console.log("\n⚠️ No records found - table might be empty");

    // Check if we can at least see the table structure
    const { error: structureError } = await supabase
      .from("interview_artifacts")
      .select("*")
      .limit(0);

    if (structureError) {
      console.log("❌ Table access error:", structureError.message);
    } else {
      console.log("✅ Table exists but is empty");
    }
  }
}

checkInterviewData().catch(console.error);
