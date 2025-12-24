import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Lock,
    User,
    Phone,
    MapPin,
    Shield,
    Building2,
    Hash,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { signUpWithEmail, signInWithEmail, UserRole } from '../services/authService';
import { mockAuth, MOCK_CREDENTIALS } from '../services/mockAuthService';

// Toggle this to use mock authentication (no Firebase needed)
const USE_MOCK_AUTH = true;

type AuthView = 'login' | 'signup-citizen' | 'signup-government';

interface AuthPageProps {
    onSuccess: (role: UserRole) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
    const [view, setView] = useState<AuthView>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Citizen Signup State
    const [citizenData, setCitizenData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        gender: 'male' as 'male' | 'female' | 'other',
        location: '',
        city: '',
        state: ''
    });

    // Government Signup State
    const [govData, setGovData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        govtId: '',
        wardNo: '',
        state: '',
        city: '',
        gender: 'male' as 'male' | 'female' | 'other'
    });

    // Handle Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (USE_MOCK_AUTH) {
                // Try mock authentication first
                const mockUser = mockAuth.login(loginEmail, loginPassword);
                if (mockUser) {
                    setSuccess('Login successful!');
                    setTimeout(() => onSuccess(mockUser.role), 1000);
                    setLoading(false);
                    return;
                }
            }

            // If mock fails or disabled, try real Firebase authentication
            const userCredential = await signInWithEmail(loginEmail, loginPassword);
            setSuccess('Login successful!');
            setTimeout(() => onSuccess('citizen'), 1000);
        } catch (err: any) {
            if (USE_MOCK_AUTH) {
                setError('Invalid credentials. Try mock: citizen@test.com or govt@test.com (password: test123), or use your Firebase account.');
            } else {
                setError(err.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle Citizen Signup
    const handleCitizenSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (citizenData.password !== citizenData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (citizenData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (citizenData.phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        const age = parseInt(citizenData.age);
        if (!citizenData.age || age < 1 || age > 120) {
            setError('Please enter a valid age');
            return;
        }

        if (!citizenData.city || !citizenData.state) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);

        try {
            await signUpWithEmail(
                citizenData.email,
                citizenData.password,
                citizenData.name,
                'citizen',
                {
                    phone: citizenData.phone,
                    age: age,
                    gender: citizenData.gender,
                    location: citizenData.location,
                    city: citizenData.city,
                    state: citizenData.state
                }
            );

            setSuccess('Account created successfully! Logging you in...');
            setTimeout(() => onSuccess('citizen'), 1500);
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Government Signup
    const handleGovSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (govData.password !== govData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (govData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!govData.govtId || !govData.wardNo || !govData.state || !govData.city) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);

        try {
            if (USE_MOCK_AUTH) {
                // Mock signup
                mockAuth.signup(govData.email, govData.name, 'government');
                setSuccess('Government account created! Logging you in...');
                setTimeout(() => onSuccess('government'), 1500);
            } else {
                // Real Firebase signup
                await signUpWithEmail(
                    govData.email,
                    govData.password,
                    govData.name,
                    'government',
                    {
                        govtId: govData.govtId,
                        wardNo: govData.wardNo,
                        state: govData.state,
                        city: govData.city,
                        gender: govData.gender,
                        organization: 'Municipal Corporation'
                    }
                );
                setSuccess('Government account created! Logging you in...');
                setTimeout(() => onSuccess('government'), 1500);
            }
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF4] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {view === 'login' && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
                        >
                            {/* Logo */}
                            <div className="text-center mb-8">
                                <div className="bg-[#8B4513] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Shield className="text-white" size={32} />
                                </div>
                                <h1 className="text-3xl font-bold text-[#2D2424]">Welcome Back</h1>
                                <p className="text-[#2D2424]/60 mt-2">Sign in to SafePaw</p>

                                {USE_MOCK_AUTH && (
                                    <div className="mt-4 p-4 bg-[#FFF8E7] border-2 border-[#E9C46A] rounded-xl text-sm text-left">
                                        <p className="font-bold text-[#8B4513] mb-2">
                                            Mock Login (Testing Mode)
                                        </p>
                                        <div className="space-y-1 text-[#2D2424]">
                                            <p><strong>Citizen:</strong> citizen@test.com</p>
                                            <p><strong>Government:</strong> govt@test.com</p>
                                            <p className="text-[#8B4513] text-xs mt-2">Password: test123</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error/Success Messages */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    {success}
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#2D2424] mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#2D2424] mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513]"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#8B4513] text-white py-3 rounded-xl font-semibold hover:bg-[#6D3610] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                    {!loading && <ArrowRight size={20} />}
                                </button>
                            </form>

                            {/* Signup Links */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-center text-sm text-[#2D2424]/60 mb-4">Don't have an account?</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setView('signup-citizen')}
                                        className="py-2 border-2 border-[#8B4513] text-[#8B4513] rounded-xl font-semibold hover:bg-[#8B4513] hover:text-white transition-colors text-sm"
                                    >
                                        Citizen Signup
                                    </button>
                                    <button
                                        onClick={() => setView('signup-government')}
                                        className="py-2 border-2 border-[#8B4513] text-[#8B4513] rounded-xl font-semibold hover:bg-[#8B4513] hover:text-white transition-colors text-sm"
                                    >
                                        Govt Signup
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {view === 'signup-citizen' && (
                        <CitizenSignupForm
                            data={citizenData}
                            setData={setCitizenData}
                            onSubmit={handleCitizenSignup}
                            onBack={() => setView('login')}
                            loading={loading}
                            error={error}
                            success={success}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                        />
                    )}

                    {view === 'signup-government' && (
                        <GovernmentSignupForm
                            data={govData}
                            setData={setGovData}
                            onSubmit={handleGovSignup}
                            onBack={() => setView('login')}
                            loading={loading}
                            error={error}
                            success={success}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Citizen Signup Form Component
const CitizenSignupForm: React.FC<any> = ({
    data, setData, onSubmit, onBack, loading, error, success, showPassword, setShowPassword
}) => (
    <motion.div
        key="signup-citizen"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
    >
        <div className="text-center mb-6">
            <div className="bg-[#8B4513] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[#2D2424]">Citizen Signup</h1>
            <p className="text-[#2D2424]/60 mt-1 text-sm">Create your SafePaw account</p>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
            </div>
        )}
        {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} />
                {success}
            </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <InputField
                icon={<User size={20} />}
                label="Full Name"
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="John Doe"
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <InputField
                    icon={<User size={20} />}
                    label="Age"
                    type="number"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: e.target.value })}
                    placeholder="25"
                    required
                    min="1"
                    max="120"
                />

                <div>
                    <label className="block text-sm font-semibold text-[#2D2424] mb-2">Gender</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['male', 'female', 'other'] as const).map((gender) => (
                            <button
                                key={gender}
                                type="button"
                                onClick={() => setData({ ...data, gender })}
                                className={`py-2 rounded-xl font-semibold text-xs transition-colors ${data.gender === gender
                                    ? 'bg-[#8B4513] text-white'
                                    : 'border-2 border-gray-200 text-[#2D2424] hover:border-[#8B4513]'
                                    }`}
                            >
                                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <InputField
                icon={<Phone size={20} />}
                label="Phone Number"
                type="tel"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="9876543210"
                required
                maxLength={10}
            />

            <InputField
                icon={<Mail size={20} />}
                label="Email"
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="your@email.com"
                required
            />

            <InputField
                icon={<MapPin size={20} />}
                label="Location/Address"
                type="text"
                value={data.location}
                onChange={(e) => setData({ ...data, location: e.target.value })}
                placeholder="Street, Area"
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <InputField
                    icon={<MapPin size={20} />}
                    label="City"
                    type="text"
                    value={data.city}
                    onChange={(e) => setData({ ...data, city: e.target.value })}
                    placeholder="Bangalore"
                    required
                />

                <InputField
                    icon={<MapPin size={20} />}
                    label="State"
                    type="text"
                    value={data.state}
                    onChange={(e) => setData({ ...data, state: e.target.value })}
                    placeholder="Karnataka"
                    required
                />
            </div>

            <PasswordField
                label="Password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />

            <InputField
                icon={<Lock size={20} />}
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={data.confirmPassword}
                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B4513] text-white py-3 rounded-xl font-semibold hover:bg-[#6D3610] transition-colors disabled:opacity-50 mt-6"
            >
                {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
                type="button"
                onClick={onBack}
                className="w-full py-3 text-[#2D2424]/60 hover:text-[#2D2424] transition-colors text-sm"
            >
                Already have an account? Sign In
            </button>
        </form>
    </motion.div>
);

// Government Signup Form Component
const GovernmentSignupForm: React.FC<any> = ({
    data, setData, onSubmit, onBack, loading, error, success, showPassword, setShowPassword
}) => (
    <motion.div
        key="signup-government"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto"
    >
        <div className="text-center mb-6">
            <div className="bg-[#8B4513] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[#2D2424]">Government Signup</h1>
            <p className="text-[#2D2424]/60 mt-1 text-sm">Official registration for government officials</p>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
            </div>
        )}
        {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} />
                {success}
            </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
            <InputField
                icon={<User size={20} />}
                label="Full Name"
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Officer Name"
                required
            />

            <InputField
                icon={<Mail size={20} />}
                label="Official Email"
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="officer@gov.in"
                required
            />

            <InputField
                icon={<Hash size={20} />}
                label="Government ID Card Number"
                type="text"
                value={data.govtId}
                onChange={(e) => setData({ ...data, govtId: e.target.value.toUpperCase() })}
                placeholder="GOV123456"
                required
            />

            <InputField
                icon={<MapPin size={20} />}
                label="Ward Number"
                type="text"
                value={data.wardNo}
                onChange={(e) => setData({ ...data, wardNo: e.target.value })}
                placeholder="Ward 12"
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <InputField
                    icon={<MapPin size={20} />}
                    label="State"
                    type="text"
                    value={data.state}
                    onChange={(e) => setData({ ...data, state: e.target.value })}
                    placeholder="Karnataka"
                    required
                />

                <InputField
                    icon={<MapPin size={20} />}
                    label="City"
                    type="text"
                    value={data.city}
                    onChange={(e) => setData({ ...data, city: e.target.value })}
                    placeholder="Bangalore"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-[#2D2424] mb-2">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                    {(['male', 'female', 'other'] as const).map((gender) => (
                        <button
                            key={gender}
                            type="button"
                            onClick={() => setData({ ...data, gender })}
                            className={`py-2 rounded-xl font-semibold text-sm transition-colors ${data.gender === gender
                                ? 'bg-[#8B4513] text-white'
                                : 'border-2 border-gray-200 text-[#2D2424] hover:border-[#8B4513]'
                                }`}
                        >
                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <PasswordField
                label="Password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />

            <InputField
                icon={<Lock size={20} />}
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={data.confirmPassword}
                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800">
                <strong>Note:</strong> Your government ID and personal details are encrypted and securely stored. They will only be used for verification purposes.
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B4513] text-white py-3 rounded-xl font-semibold hover:bg-[#6D3610] transition-colors disabled:opacity-50 mt-6"
            >
                {loading ? 'Creating Account...' : 'Create Government Account'}
            </button>

            <button
                type="button"
                onClick={onBack}
                className="w-full py-3 text-[#2D2424]/60 hover:text-[#2D2424] transition-colors text-sm"
            >
                Already have an account? Sign In
            </button>
        </form>
    </motion.div>
);

// Reusable Input Field Component
const InputField: React.FC<any> = ({ icon, label, ...props }) => (
    <div>
        <label className="block text-sm font-semibold text-[#2D2424] mb-2">{label}</label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
            </div>
            <input
                {...props}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513]"
            />
        </div>
    </div>
);

// Password Field Component
const PasswordField: React.FC<any> = ({ label, value, onChange, showPassword, setShowPassword }) => (
    <div>
        <label className="block text-sm font-semibold text-[#2D2424] mb-2">{label}</label>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513]"
                required
                minLength={6}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
        <p className="text-xs text-[#2D2424]/60 mt-1">Minimum 6 characters</p>
    </div>
);

export default AuthPage;
