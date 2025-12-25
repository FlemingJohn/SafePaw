import React from 'react';
import { seedIncidents } from '../seedData';

const SeedDataButton: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleSeed = async () => {
        setLoading(true);
        setMessage('');

        try {
            await seedIncidents(20);
            setMessage('✅ Successfully seeded 20 incidents! Refresh the map to see them.');
        } catch (error: any) {
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={handleSeed}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? '🌱 Seeding...' : '🌱 Seed Test Data'}
            </button>
            {message && (
                <div className="mt-2 bg-white p-3 rounded-lg shadow-lg text-sm max-w-xs">
                    {message}
                </div>
            )}
        </div>
    );
};

export default SeedDataButton;
