// Test utility to verify the InterviewButton logic
// This can be used to test different scenarios

import { InterviewButton } from './interview-button';

// Example usage scenarios:

// Scenario 1: No resume threshold set - should always allow interview
// Job description: { "resume_threshold": null }
// Resume score: 75
// Expected: "Start Interview" button (blue, enabled)

// Scenario 2: Resume score below threshold - should block interview  
// Job description: { "resume_threshold": "80" }
// Resume score: 70
// Expected: "Not Allowed to Interview" button (red, disabled)

// Scenario 3: Resume score meets threshold, no interview exists - should allow start
// Job description: { "resume_threshold": "70" }
// Resume score: 75
// Interview exists: false
// Expected: "Start Interview" button (blue, enabled)

// Scenario 4: Resume score meets threshold, interview completed - should show results
// Job description: { "resume_threshold": "70" }
// Resume score: 75  
// Interview exists: true, status: "completed"
// Expected: "View Results" button (green, enabled)

// Scenario 5: Resume score meets threshold, interview in progress - should allow resume
// Job description: { "resume_threshold": "70" }
// Resume score: 75
// Interview exists: true, status: "in_progress"
// Expected: "Resume Interview" button (blue, enabled)

export function InterviewButtonTestPage() {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold">Interview Button Test Cases</h1>
            
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Test with your application ID:</h2>
                <div className="bg-gray-100 p-4 rounded">
                    <InterviewButton applicationId="your-test-application-id" />
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Expected Button States:</h3>
                <ul className="space-y-2 text-sm">
                    <li><strong>Loading:</strong> Gray button with "Loading..." text</li>
                    <li><strong>No threshold:</strong> Blue "Start Interview" button</li>
                    <li><strong>Score below threshold:</strong> Red "Not Allowed to Interview" button (disabled)</li>
                    <li><strong>Score meets threshold + no interview:</strong> Blue "Start Interview" button</li>
                    <li><strong>Score meets threshold + completed interview:</strong> Green "View Results" button</li>
                    <li><strong>Score meets threshold + in-progress interview:</strong> Blue "Resume Interview" button</li>
                </ul>
            </div>
        </div>
    );
}
