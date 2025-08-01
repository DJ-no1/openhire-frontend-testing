// Run this in your browser console to create the test candidate
// Make sure you're on a page where supabase is available (e.g., /test/debug)

async function createTestCandidate() {
  const candidateId = "2a218b64-c1f2-4cec-9ed4-0b4a7541b859";

  try {
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("id", candidateId)
      .single();

    if (existingUser) {
      console.log("✅ Candidate already exists:", existingUser);
      return existingUser;
    }

    // Create the user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        id: candidateId,
        email: "testcandidate@openhire.com",
        role: "candidate",
        name: "Test Candidate",
      })
      .select()
      .single();

    if (createError) {
      console.error("❌ Failed to create candidate:", createError);
      throw createError;
    }

    console.log("✅ Successfully created test candidate:", newUser);
    return newUser;
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Run the function
createTestCandidate();
