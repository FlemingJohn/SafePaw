/**
 * Input Sanitization Utility
 * Prevents XSS attacks by sanitizing user inputs
 */

/**
 * Sanitize text input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeTextInput(input: string, maxLength: number = 500): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove script-related content
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // Encode special characters
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    // Trim and limit length
    return sanitized.trim().substring(0, maxLength);
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
        return '';
    }

    // Basic email sanitization
    return email.toLowerCase().trim();
}

/**
 * Sanitize phone number
 */
export function sanitizePhoneNumber(phone: string): string {
    if (!phone || typeof phone !== 'string') {
        return '';
    }

    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
}

/**
 * Validate and sanitize incident ID
 */
export function sanitizeIncidentId(id: string): string {
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid incident ID');
    }

    // Only allow alphanumeric and hyphens
    const sanitized = id.replace(/[^a-zA-Z0-9-]/g, '');

    if (sanitized.length === 0) {
        throw new Error('Invalid incident ID format');
    }

    return sanitized;
}

/**
 * Validate and sanitize recommendation ID
 */
export function sanitizeRecommendationId(id: string): string {
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid recommendation ID');
    }

    // Only allow alphanumeric, hyphens, and underscores
    const sanitized = id.replace(/[^a-zA-Z0-9-_]/g, '');

    if (sanitized.length === 0) {
        throw new Error('Invalid recommendation ID format');
    }

    return sanitized;
}
