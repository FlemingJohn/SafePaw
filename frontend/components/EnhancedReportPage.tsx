import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation,
    Camera,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    Clock,
    User,
    Activity,
    Users,
    MapPin,
    Phone,
    Shield
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import {
    checkRecentIncidents,
    checkDuplicateReport,
    getNearbyHospitals,
    type Hospital
} from '../services/incidentService';

interface EnhancedReportPageProps {
    onSuccess?: () => void;
}

const EnhancedReportPage: React.FC<EnhancedReportPageProps> = ({ onSuccess }) => {
    // Form Mode
    const [reportMode, setReportMode] = useState<'quick' | 'detailed'>('quick');

    // Basic Fields
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [dogType, setDogType] = useState<'Stray' | 'Pet'>('Stray');
    const [severity, setSeverity] = useState<'Minor' | 'Moderate' | 'Severe' | undefined>(undefined);
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);

    // Enhanced Fields - Time & Date
    const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
    const [incidentTime, setIncidentTime] = useState(new Date().toTimeString().slice(0, 5));

    // Enhanced Fields - Victim Information
    const [victimAge, setVictimAge] = useState<'Child' | 'Teen' | 'Adult' | 'Elderly' | undefined>(undefined);
    const [injuryLocation, setInjuryLocation] = useState('');
    const [medicalAttention, setMedicalAttention] = useState(false);
    const [hospitalName, setHospitalName] = useState('');

    // Enhanced Fields - Incident Context
    const [activity, setActivity] = useState('');
    const [provocation, setProvocation] = useState<'Provoked' | 'Unprovoked' | 'Unknown'>('Unknown');
    const [witnessPresent, setWitnessPresent] = useState(false);
    const [witnessContact, setWitnessContact] = useState('');

    // Enhanced Fields - Priority Indicators
    const [rabiesConcern, setRabiesConcern] = useState(false);
    const [repeatOffender, setRepeatOffender] = useState(false);
    const [childrenAtRisk, setChildrenAtRisk] = useState(false);

    // Smart Features State
    const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
    const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
    const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
    const [showValidation, setShowValidation] = useState(false);

    // Form State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Auto-detect location
    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setLocation(`${lat}, ${lng}`);
                    setCoordinates({ lat, lng });

                    // Trigger smart validations
                    await performSmartValidations(lat, lng);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocation('Location detection failed');
                }
            );
        }
    };

    // Perform smart validations
    const performSmartValidations = async (lat: number, lng: number) => {
        setShowValidation(true);

        try {
            // Check for recent incidents
            const recent = await checkRecentIncidents(lat, lng, 0.5, 48);
            setRecentIncidents(recent);

            // Check for duplicate
            const { auth } = await import('../lib/firebase');
            const user = auth.currentUser;
            if (user) {
                const duplicate = await checkDuplicateReport(user.uid, lat, lng, 24);
                if (duplicate.isDuplicate) {
                    setDuplicateWarning(duplicate.existingReport);
                }
            }

            // Get nearby hospitals
            const hospitals = await getNearbyHospitals(lat, lng, 5);
            setNearbyHospitals(hospitals);
        } catch (error) {
            console.error('Error performing validations:', error);
        }
    };

    // Handle photo upload
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPhotos(Array.from(e.target.files));
        }
    };

    // Submit incident
    const handleSubmit = async () => {
        if (!severity) {
            alert('Please select a severity level');
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const { submitIncident } = await import('../services/incidentService');
            const { auth } = await import('../lib/firebase');

            const user = auth.currentUser;
            if (!user) {
                alert('Please sign in to submit a report');
                return;
            }

            // Parse location
            const [lat, lng] = location.split(',').map(s => parseFloat(s.trim()));

            // Create incident date/time
            const incidentDateTime = Timestamp.fromDate(new Date(`${incidentDate}T${incidentTime}`));

            const incidentId = await submitIncident({
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userPhone: user.phoneNumber || undefined,
                location: {
                    address: location,
                    lat: lat || 0,
                    lng: lng || 0,
                },
                dogType,
                severity,
                description,
                photos: photos,
                anonymous: false,

                // Enhanced fields
                incidentDateTime: reportMode === 'detailed' ? incidentDateTime : undefined,
                victimAge: reportMode === 'detailed' ? victimAge : undefined,
                injuryLocation: reportMode === 'detailed' ? injuryLocation : undefined,
                medicalAttention: reportMode === 'detailed' ? medicalAttention : undefined,
                hospitalName: reportMode === 'detailed' && medicalAttention ? hospitalName : undefined,
                activity: reportMode === 'detailed' ? activity : undefined,
                provocation: reportMode === 'detailed' ? provocation : undefined,
                witnessPresent: reportMode === 'detailed' ? witnessPresent : undefined,
                witnessContact: reportMode === 'detailed' && witnessPresent ? witnessContact : undefined,
                rabiesConcern: reportMode === 'detailed' ? rabiesConcern : undefined,
                repeatOffender: reportMode === 'detailed' ? repeatOffender : undefined,
                childrenAtRisk: reportMode === 'detailed' ? childrenAtRisk : undefined,
                reportMode,
            });

            console.log('Incident submitted:', incidentId);
            setSuccess(true);

            // Reset form
            setTimeout(() => {
                resetForm();
                onSuccess?.();
            }, 3000);

        } catch (error: any) {
            console.error('Error submitting incident:', error);
            alert(`Failed to submit: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setLocation('');
        setCoordinates(null);
        setSeverity(undefined);
        setDescription('');
        setPhotos([]);
        setSuccess(false);
        setShowValidation(false);
        setRecentIncidents([]);
        setDuplicateWarning(null);
        setNearbyHospitals([]);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-2">Report Incident</h1>
                    <p className="text-[#2D2424]/60">Help us track and prevent dog bite incidents in your area.</p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setReportMode('quick')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${reportMode === 'quick'
                                ? 'bg-white text-[#8B4513] shadow-sm'
                                : 'text-gray-600'
                            }`}
                    >
                        Quick Report
                    </button>
                    <button
                        onClick={() => setReportMode('detailed')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${reportMode === 'detailed'
                                ? 'bg-white text-[#8B4513] shadow-sm'
                                : 'text-gray-600'
                            }`}
                    >
                        Detailed Report
                    </button>
                </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl mb-6"
                    >
                        ✅ Incident reported successfully! AI agents are analyzing your report.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Duplicate Warning */}
            <AnimatePresence>
                {duplicateWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-orange-100 border border-orange-400 text-orange-700 px-6 py-4 rounded-xl mb-6"
                    >
                        ⚠️ You recently reported an incident from this location. Are you sure you want to submit another report?
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recent Incidents Alert */}
            <AnimatePresence>
                {showValidation && recentIncidents.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-xl mb-6"
                    >
                        ℹ️ {recentIncidents.length} incident(s) reported in this area in the last 48 hours.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Form */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
                {/* Location */}
                <div>
                    <label className="block text-sm font-semibold text-[#2D2424] mb-2">
                        Location <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Auto-detected: Current Location"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                        />
                        <button
                            onClick={detectLocation}
                            className="bg-[#8B4513] text-white px-4 rounded-xl hover:bg-[#6D3610] transition-colors"
                        >
                            <Navigation size={20} />
                        </button>
                    </div>
                </div>

                {/* Severity */}
                <div>
                    <label className="block text-sm font-semibold text-[#2D2424] mb-3">
                        Severity Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setSeverity('Minor')}
                            className={`border-2 py-3 rounded-xl transition-colors ${severity === 'Minor'
                                    ? 'border-[#8AB17D] bg-[#8AB17D]/10 text-[#8AB17D]'
                                    : 'border-gray-200 text-gray-600 hover:border-[#8AB17D] hover:text-[#8AB17D]'
                                }`}
                        >
                            <CheckCircle2 size={32} className="mx-auto mb-1" />
                            <div className="text-xs font-semibold">Minor</div>
                        </button>
                        <button
                            onClick={() => setSeverity('Moderate')}
                            className={`border-2 py-3 rounded-xl transition-colors ${severity === 'Moderate'
                                    ? 'border-[#E9C46A] bg-[#E9C46A]/10 text-[#BC6C25]'
                                    : 'border-gray-200 text-gray-600'
                                }`}
                        >
                            <AlertTriangle size={32} className="mx-auto mb-1" />
                            <div className="text-xs font-semibold">Moderate</div>
                        </button>
                        <button
                            onClick={() => setSeverity('Severe')}
                            className={`border-2 py-3 rounded-xl transition-colors ${severity === 'Severe'
                                    ? 'border-red-400 bg-red-50 text-red-600'
                                    : 'border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600'
                                }`}
                        >
                            <AlertCircle size={32} className="mx-auto mb-1" />
                            <div className="text-xs font-semibold">Severe</div>
                        </button>
                    </div>
                </div>

                {/* Photo Upload */}
                <div>
                    <label className="block text-sm font-semibold text-[#2D2424] mb-3">Add Photo (Optional)</label>
                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#8B4513] transition-colors cursor-pointer block">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                            {photos.length > 0 ? `${photos.length} photo(s) selected` : 'Click to upload or drag and drop'}
                        </p>
                    </label>
                </div>

                {/* Detailed Mode Fields */}
                <AnimatePresence>
                    {reportMode === 'detailed' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6 border-t pt-6"
                        >
                            {/* Time & Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#2D2424] mb-2">Incident Date</label>
                                    <input
                                        type="date"
                                        value={incidentDate}
                                        onChange={(e) => setIncidentDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#2D2424] mb-2">Incident Time</label>
                                    <input
                                        type="time"
                                        value={incidentTime}
                                        onChange={(e) => setIncidentTime(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                                    />
                                </div>
                            </div>

                            {/* Victim Age */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2D2424] mb-3">Victim Age Group</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {(['Child', 'Teen', 'Adult', 'Elderly'] as const).map((age) => (
                                        <button
                                            key={age}
                                            onClick={() => setVictimAge(age)}
                                            className={`border-2 py-3 rounded-xl font-semibold text-sm transition-colors ${victimAge === age
                                                    ? 'border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513]'
                                                    : 'border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {age}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Injury Location */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2D2424] mb-2">Injury Location on Body</label>
                                <input
                                    type="text"
                                    value={injuryLocation}
                                    onChange={(e) => setInjuryLocation(e.target.value)}
                                    placeholder="e.g., Left arm, Right leg, Hand"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                                />
                            </div>

                            {/* Medical Attention */}
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={medicalAttention}
                                        onChange={(e) => setMedicalAttention(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513]"
                                    />
                                    <span className="text-sm font-semibold text-[#2D2424]">Medical attention received</span>
                                </label>
                                {medicalAttention && (
                                    <input
                                        type="text"
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                        placeholder="Hospital/Clinic name"
                                        className="mt-3 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                                    />
                                )}
                            </div>

                            {/* Activity */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2D2424] mb-2">Activity During Incident</label>
                                <select
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                                >
                                    <option value="">Select activity</option>
                                    <option value="Walking">Walking</option>
                                    <option value="Jogging">Jogging</option>
                                    <option value="Cycling">Cycling</option>
                                    <option value="Standing">Standing</option>
                                    <option value="Playing">Playing</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Provocation */}
                            <div>
                                <label className="block text-sm font-semibold text-[#2D2424] mb-3">Was the dog provoked?</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['Provoked', 'Unprovoked', 'Unknown'] as const).map((prov) => (
                                        <button
                                            key={prov}
                                            onClick={() => setProvocation(prov)}
                                            className={`border-2 py-3 rounded-xl font-semibold text-sm transition-colors ${provocation === prov
                                                    ? 'border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513]'
                                                    : 'border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {prov}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Witness */}
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={witnessPresent}
                                        onChange={(e) => setWitnessPresent(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513]"
                                    />
                                    <span className="text-sm font-semibold text-[#2D2424]">Witnesses present</span>
                                </label>
                                {witnessPresent && (
                                    <input
                                        type="text"
                                        value={witnessContact}
                                        onChange={(e) => setWitnessContact(e.target.value)}
                                        placeholder="Witness contact (optional)"
                                        className="mt-3 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                                    />
                                )}
                            </div>

                            {/* Priority Indicators */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                                <h3 className="font-bold text-[#2D2424] mb-3">Priority Indicators</h3>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rabiesConcern}
                                        onChange={(e) => setRabiesConcern(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                                    />
                                    <span className="text-sm font-semibold text-[#2D2424]">Rabies concern (dog foaming, acting strange)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={repeatOffender}
                                        onChange={(e) => setRepeatOffender(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                                    />
                                    <span className="text-sm font-semibold text-[#2D2424]">Repeat offender (seen this dog before)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={childrenAtRisk}
                                        onChange={(e) => setChildrenAtRisk(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                                    />
                                    <span className="text-sm font-semibold text-[#2D2424]">Children at risk (near school/playground)</span>
                                </label>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dog Type */}
                <div>
                    <label className="block text-sm font-semibold text-[#2D2424] mb-3">Dog Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setDogType('Stray')}
                            className={`border-2 font-semibold py-3 rounded-xl transition-colors ${dogType === 'Stray'
                                    ? 'border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513]'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            Stray Dog
                        </button>
                        <button
                            onClick={() => setDogType('Pet')}
                            className={`border-2 font-semibold py-3 rounded-xl transition-colors ${dogType === 'Pet'
                                    ? 'border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513]'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            Pet Dog
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-[#2D2424] mb-2">Description (Optional)</label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide any additional details..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                    />
                </div>

                {/* Nearby Hospitals */}
                <AnimatePresence>
                    {nearbyHospitals.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                        >
                            <h3 className="font-bold text-[#2D2424] mb-3 flex items-center gap-2">
                                <MapPin size={20} className="text-blue-600" />
                                Nearby Hospitals
                            </h3>
                            <div className="space-y-2">
                                {nearbyHospitals.slice(0, 3).map((hospital) => (
                                    <div key={hospital.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-sm text-[#2D2424]">{hospital.name}</p>
                                            <p className="text-xs text-gray-600">{hospital.distance?.toFixed(1)} km away</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hospital.vaccineAvailable && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    Vaccine Available
                                                </span>
                                            )}
                                            <a
                                                href={`tel:${hospital.phone}`}
                                                className="bg-[#8B4513] text-white p-2 rounded-lg hover:bg-[#6D3610] transition-colors"
                                            >
                                                <Phone size={16} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !location || !severity}
                    className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/20 hover:bg-[#6D3610] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </div>
        </div>
    );
};

export default EnhancedReportPage;
