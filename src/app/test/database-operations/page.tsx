'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AuthTestSuite, TestResult } from '@/utils/auth-test-suite';
import { validateUserDataConsistency } from '@/lib/user-sync';
import { syncCurrentUserName } from '@/lib/fix-user-names';

export default function DatabaseTestPage() {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [userIdToCheck, setUserIdToCheck] = useState('');
    const [validationResult, setValidationResult] = useState<any>(null);
    const [nameFixResult, setNameFixResult] = useState<any>(null);

    const fixCurrentUserName = async () => {
        try {
            const result = await syncCurrentUserName();
            setNameFixResult(result);
        } catch (error) {
            setNameFixResult({ success: false, message: `Error: ${error}` });
        }
    };

    const runFullTestSuite = async () => {
        setIsRunning(true);
        setTestResults([]);

        try {
            const { results, summary } = await AuthTestSuite.runFullTestSuite();
            setTestResults(results);
            console.log(summary);
        } catch (error) {
            console.error('Test suite error:', error);
            setTestResults([{ success: false, message: `Test suite failed: ${error}` }]);
        } finally {
            setIsRunning(false);
        }
    };

    const checkUserConsistency = async () => {
        if (!userIdToCheck.trim()) return;

        try {
            const validation = await validateUserDataConsistency(userIdToCheck);
            setValidationResult(validation);
        } catch (error) {
            setValidationResult({ isConsistent: false, issues: [`Error: ${error}`] });
        }
    };

    const testCandidateSignup = async () => {
        setIsRunning(true);
        const timestamp = Date.now();
        const email = `test-candidate-${timestamp}@openhire-test.com`;
        const result = await AuthTestSuite.testCandidateSignup(email, 'test123456', 'Test Candidate');
        setTestResults([result]);
        setIsRunning(false);
    };

    const testRecruiterSignup = async () => {
        setIsRunning(true);
        const timestamp = Date.now();
        const email = `test-recruiter-${timestamp}@openhire-test.com`;
        const result = await AuthTestSuite.testRecruiterSignup(email, 'test123456', 'Test Recruiter');
        setTestResults([result]);
        setIsRunning(false);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Database Operations Test Suite</h1>
                <p className="text-gray-600 mt-2">
                    Test user account creation and data synchronization between auth and users table
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Test Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Controls</CardTitle>
                        <CardDescription>
                            Run tests to verify database operations work correctly
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={runFullTestSuite}
                            disabled={isRunning}
                            className="w-full"
                        >
                            {isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={testCandidateSignup}
                                disabled={isRunning}
                                variant="outline"
                            >
                                Test Candidate
                            </Button>
                            <Button
                                onClick={testRecruiterSignup}
                                disabled={isRunning}
                                variant="outline"
                            >
                                Test Recruiter
                            </Button>
                        </div>

                        <Button
                            onClick={fixCurrentUserName}
                            variant="secondary"
                            className="w-full"
                        >
                            🔧 Fix Current User Name
                        </Button>

                        {nameFixResult && (
                            <div className={`p-3 rounded border ${nameFixResult.success
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                <p className="font-medium">
                                    {nameFixResult.success ? '✅ Success' : '❌ Error'}
                                </p>
                                <p className="text-sm mt-1">{nameFixResult.message}</p>
                                {nameFixResult.data && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-xs">Details</summary>
                                        <pre className="text-xs mt-1 bg-white/50 p-2 rounded">
                                            {JSON.stringify(nameFixResult.data, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* User Validation */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Data Validation</CardTitle>
                        <CardDescription>
                            Check consistency between auth and users table for specific user
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                placeholder="Enter user ID to validate"
                                value={userIdToCheck}
                                onChange={(e) => setUserIdToCheck(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={checkUserConsistency}
                            disabled={!userIdToCheck.trim()}
                            className="w-full"
                        >
                            Validate User Data
                        </Button>

                        {validationResult && (
                            <div className={`p-3 rounded border ${validationResult.isConsistent
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                <p className="font-medium">
                                    {validationResult.isConsistent ? '✅ Data Consistent' : '❌ Data Inconsistent'}
                                </p>
                                {validationResult.issues && validationResult.issues.length > 0 && (
                                    <ul className="mt-2 text-sm list-disc list-inside">
                                        {validationResult.issues.map((issue: string, index: number) => (
                                            <li key={index}>{issue}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Test Results</CardTitle>
                        <CardDescription>
                            Results from running database operation tests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {testResults.map((result, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded border ${result.success
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {result.success ? '✅ PASS' : '❌ FAIL'}
                                        </span>
                                    </div>
                                    <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                                        {result.message}
                                    </p>
                                    {result.details && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer font-medium">
                                                View Details
                                            </summary>
                                            <Textarea
                                                value={JSON.stringify(result.details, null, 2)}
                                                readOnly
                                                className="mt-2 h-32 text-xs font-mono"
                                            />
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Implementation Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Implementation Summary</CardTitle>
                    <CardDescription>
                        What was fixed in the database operations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-green-800">✅ Fixed Issues</h4>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                                <li>Name field from registration form now saves to users.name</li>
                                <li>Display name now updates in auth.users.display_name</li>
                                <li>Role field properly saves to users.role with validation</li>
                                <li>Synchronization between auth metadata and custom user table</li>
                                <li>Proper error handling for database constraint violations</li>
                                <li>Atomic operations with rollback on failure</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium text-blue-800">🔧 Implementation Details</h4>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                                <li>Updated signUp function to include display_name in auth metadata</li>
                                <li>Added auth.updateUser() calls to sync display_name</li>
                                <li>Enhanced error handling in user profile creation</li>
                                <li>Created user-sync utility for data consistency</li>
                                <li>Added validation functions for data integrity</li>
                                <li>Updated all auth hooks and contexts for consistency</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium text-purple-800">🎯 Success Criteria</h4>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                                <li>Name from registration form saves to users.name ✅</li>
                                <li>Role from registration form saves to users.role ✅</li>
                                <li>Display name updates in auth.users.display_name ✅</li>
                                <li>Both tables remain synchronized ✅</li>
                                <li>No data inconsistency between auth and user tables ✅</li>
                                <li>Proper error handling for failed operations ✅</li>
                                <li>All database constraints are respected ✅</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
