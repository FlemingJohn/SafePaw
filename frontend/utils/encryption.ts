import CryptoJS from 'crypto-js';

// Encryption key - In production, use environment variable
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'safepaw-default-key-change-in-production';

/**
 * Encrypt sensitive data before storing in Firestore
 * @param data - Plain text data to encrypt
 * @returns Encrypted string
 */
export const encryptData = (data: string): string => {
    try {
        return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt sensitive data retrieved from Firestore
 * @param encryptedData - Encrypted string
 * @returns Decrypted plain text
 */
export const decryptData = (encryptedData: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
            throw new Error('Decryption failed - invalid key or corrupted data');
        }

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Hash sensitive data for one-way encryption (cannot be decrypted)
 * Useful for verification without storing original data
 * @param data - Data to hash
 * @returns SHA256 hash
 */
export const hashData = (data: string): string => {
    return CryptoJS.SHA256(data).toString();
};
