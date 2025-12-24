import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    UserCredential,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserRole = 'citizen' | 'government' | 'ngo';

export interface UserProfile {
    uid: string;
    email?: string;
    phone?: string;
    role: UserRole;
    name: string;
    createdAt: Date;
    organization?: string; // For government/NGO users
    district?: string; // For government users
}

// Email/Password Authentication
export const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    role: UserRole = 'citizen',
    additionalData?: {
        phone?: string;
        age?: number;
        gender?: 'male' | 'female' | 'other';
        location?: string;
        city?: string;
        state?: string;
        govtId?: string;
        wardNo?: string;
        organization?: string;
    }
): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user profile in Firestore with all data
        const userProfile: any = {
            uid: userCredential.user.uid,
            email,
            role,
            name,
            createdAt: new Date(),
        };

        // Add additional data if provided (securely stored)
        if (additionalData) {
            if (additionalData.phone) userProfile.phone = additionalData.phone;
            if (additionalData.age) userProfile.age = additionalData.age;
            if (additionalData.gender) userProfile.gender = additionalData.gender;
            if (additionalData.location) userProfile.location = additionalData.location;
            if (additionalData.city) userProfile.city = additionalData.city;
            if (additionalData.state) userProfile.state = additionalData.state;
            if (additionalData.govtId) userProfile.govtId = additionalData.govtId;
            if (additionalData.wardNo) userProfile.wardNo = additionalData.wardNo;
            if (additionalData.organization) userProfile.organization = additionalData.organization;
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

        return userCredential;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const signInWithEmail = async (
    email: string,
    password: string
): Promise<UserCredential> => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Phone Authentication (OTP)
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
            // reCAPTCHA solved
        }
    });
};

export const sendOTP = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
    try {
        // Phone number must be in format: +91XXXXXXXXXX
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
        return await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const verifyOTP = async (
    confirmationResult: ConfirmationResult,
    otp: string,
    name: string,
    role: UserRole = 'citizen'
): Promise<UserCredential> => {
    try {
        const userCredential = await confirmationResult.confirm(otp);

        // Check if user profile exists
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (!userDoc.exists()) {
            // Create user profile for new users
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                phone: userCredential.user.phoneNumber,
                role,
                name,
                createdAt: new Date(),
            });
        }

        return userCredential;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Sign Out
export const logout = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Get Current User
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// Listen to Auth State Changes
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Get User Profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
        return null;
    } catch (error: any) {
        throw new Error(error.message);
    }
};
