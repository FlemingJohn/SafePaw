/**
 * Password Validation Utility
 * Enforces strong password requirements
 */

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates password strength
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password || typeof password !== 'string') {
        return {
            isValid: false,
            errors: ['Password is required']
        };
    }

    // Minimum length check
    if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }

    // Common password check (basic)
    const commonPasswords = [
        'password123', '123456789012', 'qwerty123456', 'admin123456',
        'welcome12345', 'password1234', 'letmein12345'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('This password is too common. Please choose a more unique password');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get password strength level
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
    if (!password) return 'weak';

    let score = 0;

    // Length scoring
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (password.length >= 20) score++;

    // Character variety scoring
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;

    // Complexity scoring
    if (/[A-Z].*[A-Z]/.test(password)) score++; // Multiple uppercase
    if (/[0-9].*[0-9]/.test(password)) score++; // Multiple numbers
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?].*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++; // Multiple special chars

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    if (score <= 7) return 'strong';
    return 'very-strong';
}
