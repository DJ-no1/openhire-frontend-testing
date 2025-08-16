/**
 * Utility functions for handling interview artifact IDs
 */

/**
 * Extracts the latest (last) interview artifact ID from a comma-separated string
 * @param interviewArtifactIds - Single UUID or comma-separated UUIDs
 * @returns The latest UUID or null if invalid
 */
export function getLatestInterviewArtifactId(interviewArtifactIds: string | null): string | null {
    if (!interviewArtifactIds) return null;

    // Split by comma and get the last one (most recent)
    const ids = interviewArtifactIds.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (ids.length === 0) return null;

    const latestId = ids[ids.length - 1];

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return uuidRegex.test(latestId) ? latestId : null;
}

/**
 * Gets all interview artifact IDs from a comma-separated string
 * @param interviewArtifactIds - Single UUID or comma-separated UUIDs
 * @returns Array of valid UUIDs
 */
export function getAllInterviewArtifactIds(interviewArtifactIds: string | null): string[] {
    if (!interviewArtifactIds) return [];

    const ids = interviewArtifactIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return ids.filter(id => uuidRegex.test(id));
}

/**
 * Validates if a string is a valid UUID format
 * @param uuid - String to validate
 * @returns Boolean indicating if the string is a valid UUID
 */
export function isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
