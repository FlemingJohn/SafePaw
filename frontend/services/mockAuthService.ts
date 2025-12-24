// Mock Authentication Service for Testing
// This allows testing without Firebase setup

export type UserRole = 'citizen' | 'government' | 'ngo';

export interface MockUser {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
}

// Mock users for testing
const MOCK_USERS: MockUser[] = [
    {
        uid: 'citizen-001',
        email: 'citizen@test.com',
        name: 'Test Citizen',
        role: 'citizen'
    },
    {
        uid: 'govt-001',
        email: 'govt@test.com',
        name: 'Government Official',
        role: 'government'
    }
];

// Store current user in sessionStorage
const STORAGE_KEY = 'mock_current_user';

export const mockAuth = {
    // Mock login
    login: (email: string, password: string): MockUser | null => {
        // Simple mock: any password works for demo
        const user = MOCK_USERS.find(u => u.email === email);
        if (user) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    },

    // Mock signup
    signup: (email: string, name: string, role: UserRole): MockUser => {
        const newUser: MockUser = {
            uid: `${role}-${Date.now()}`,
            email,
            name,
            role
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        return newUser;
    },

    // Get current user
    getCurrentUser: (): MockUser | null => {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    // Logout
    logout: () => {
        sessionStorage.removeItem(STORAGE_KEY);
    },

    // Check if authenticated
    isAuthenticated: (): boolean => {
        return !!sessionStorage.getItem(STORAGE_KEY);
    }
};

// Mock credentials for easy testing
export const MOCK_CREDENTIALS = {
    citizen: {
        email: 'citizen@test.com',
        password: 'test123',
        name: 'Test Citizen'
    },
    government: {
        email: 'govt@test.com',
        password: 'test123',
        name: 'Government Official'
    }
};
