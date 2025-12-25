import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Phone } from 'lucide-react';
import MapComponent from './MapComponent';

// Safety & Emergency Page Component (merged Heatmap + Emergency)
const SafetyPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'heatmap' | 'emergency'>('heatmap');

    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-4">Safety & Emergency</h1>
            <p className="text-[#2D2424]/60 mb-6">Check risk zones and find emergency help</p>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
                <button
                    onClick={() => setActiveTab('heatmap')}
                    className={`pb-3 px-4 font-semibold transition-colors relative ${activeTab === 'heatmap'
                        ? 'text-[#8B4513]'
                        : 'text-[#2D2424]/60 hover:text-[#2D2424]'
                        }`}
                >
                    Risk Heatmap
                    {activeTab === 'heatmap' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B4513]"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('emergency')}
                    className={`pb-3 px-4 font-semibold transition-colors relative ${activeTab === 'emergency'
                        ? 'text-[#8B4513]'
                        : 'text-[#2D2424]/60 hover:text-[#2D2424]'
                        }`}
                >
                    Emergency Help
                    {activeTab === 'emergency' && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B4513]"
                        />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'heatmap' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    {/* Risk Heatmap Content */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 mb-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-[#8B4513] p-3 rounded-xl">
                                <MapPin size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[#2D2424]">Live Risk Heatmap</h2>
                                <p className="text-sm text-[#2D2424]/60">Check incident density in your area</p>
                            </div>
                        </div>

                        {/* Map Component */}
                        <div className="rounded-2xl overflow-hidden border-2 border-gray-100 mb-6 h-96 md:h-[500px]">
                            <MapComponent />
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                                <p className="text-sm font-semibold text-green-900">Low Risk</p>
                                <p className="text-xs text-green-700">0-5 incidents</p>
                            </div>
                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                                <p className="text-sm font-semibold text-yellow-900">Medium Risk</p>
                                <p className="text-xs text-yellow-700">6-15 incidents</p>
                            </div>
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                                <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                                <p className="text-sm font-semibold text-red-900">High Risk</p>
                                <p className="text-xs text-red-700">16+ incidents</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'emergency' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    {/* Emergency Help Content */}
                    <div className="grid gap-6">
                        {/* Emergency Hotline */}
                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 md:p-8 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle size={32} />
                                <div>
                                    <h2 className="text-2xl font-bold">Emergency Hotline</h2>
                                    <p className="text-white/80 text-sm">Available 24/7</p>
                                </div>
                            </div>
                            <a
                                href="tel:1962"
                                className="block bg-white text-red-600 text-center py-4 rounded-xl font-bold text-xl hover:bg-red-50 transition-colors"
                            >
                                📞 Call 1962 (Animal Control)
                            </a>
                        </div>

                        {/* Nearest Hospitals */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-[#8B4513] p-3 rounded-xl">
                                    <MapPin size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[#2D2424]">Nearest Hospitals</h2>
                                    <p className="text-sm text-[#2D2424]/60">With rabies vaccine available</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <HospitalCard
                                    name="Apollo Hospital"
                                    distance="1.2 km"
                                    address="Bannerghatta Road, Bangalore"
                                    phone="+91 80 2692 2222"
                                    hasVaccine={true}
                                />
                                <HospitalCard
                                    name="Manipal Hospital"
                                    distance="2.5 km"
                                    address="HAL Airport Road, Bangalore"
                                    phone="+91 80 2502 4444"
                                    hasVaccine={true}
                                />
                                <HospitalCard
                                    name="Fortis Hospital"
                                    distance="3.8 km"
                                    address="Cunningham Road, Bangalore"
                                    phone="+91 80 6621 4444"
                                    hasVaccine={false}
                                />
                            </div>
                        </div>

                        {/* First Aid Guide */}
                        <div className="bg-[#FFF8E7] border-2 border-[#E9C46A] rounded-3xl p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-[#2D2424] mb-4">First Aid Steps</h2>
                            <ol className="space-y-3 text-[#2D2424]">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-[#8B4513] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                    <span>Wash the wound immediately with soap and water for 15 minutes</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-[#8B4513] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                    <span>Apply antiseptic (Betadine/Dettol) to the wound</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-[#8B4513] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                    <span>Do NOT bandage the wound - leave it open</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-[#8B4513] text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                                    <span>Rush to nearest hospital within 24 hours for rabies vaccine</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-[#8B4513] text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                                    <span>Report the incident to authorities immediately</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// Hospital Card Component
interface HospitalCardProps {
    name: string;
    distance: string;
    address: string;
    phone: string;
    hasVaccine: boolean;
}

const HospitalCard: React.FC<HospitalCardProps> = ({ name, distance, address, phone, hasVaccine }) => (
    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100 hover:border-[#8B4513]/30 transition-colors">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="font-bold text-[#2D2424]">{name}</h3>
                <p className="text-sm text-[#2D2424]/60">{address}</p>
            </div>
            <span className="text-sm font-semibold text-[#8B4513]">{distance}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
            <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 text-sm text-[#8B4513] font-semibold hover:underline"
            >
                <Phone size={16} />
                {phone}
            </a>
            {hasVaccine && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ✓ Vaccine Available
                </span>
            )}
        </div>
    </div>
);

export default SafetyPage;
