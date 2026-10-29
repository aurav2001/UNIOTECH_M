import React, { useState } from 'react';
import { apiRequest } from '../../utils/api';
import { webDevelopmentData } from '../../data/webDevelopmentData';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const SyncWebDevPage = () => {
    const [status, setStatus] = useState('idle'); // idle | syncing | success | error
    const [message, setMessage] = useState('');

    const handleSync = async () => {
        setStatus('syncing');
        setMessage('Starting sync process...');

        try {
            // 1. Check if page exists
            setMessage('Checking existing page...');
            const checkRes = await apiRequest(`/api/pages?slug=${webDevelopmentData.slug}`);
            const checkData = await checkRes.json();

            console.log('Check Data Response:', checkData);

            let existingPageId = null;
            let existingPageData = null;

            // Handle standard array response
            if (Array.isArray(checkData)) {
                if (checkData.length > 0) {
                    existingPageData = checkData[0];
                }
            }
            // Handle paginated response { data: [...] }
            else if (checkData && Array.isArray(checkData.data)) {
                if (checkData.data.length > 0) {
                    existingPageData = checkData.data[0];
                }
            }
            // Handle single object match
            else if (checkData && (checkData._id || checkData.id)) {
                existingPageData = checkData;
            }

            if (existingPageData) {
                // Ensure ID is valid (Mongo ID is 24 chars, or at least a string)
                const id = existingPageData._id || existingPageData.id;
                if (id && typeof id === 'string' && id.length > 5) {
                    existingPageId = id;
                    setMessage(`Found existing page (ID: ${existingPageId}). Preparing update...`);
                } else {
                    console.warn("Found data but ID seemed invalid:", id);
                }
            } else {
                setMessage('Page not found. Creating new page...');
            }

            // 2. Prepare payload
            // Ensure we include all field from the data file
            const payload = {
                ...webDevelopmentData,
                isPublished: true // Ensure it is published
            };

            // 3. Create or Update
            if (existingPageId) {
                // Use the CORRECT ID
                const updateRes = await apiRequest(`/api/pages/${existingPageId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });

                if (!updateRes.ok) {
                    const errorText = await updateRes.text();
                    throw new Error(`Failed to update page (${updateRes.status}): ${errorText}`);
                }
                setMessage('Page updated successfully!');
            } else {
                const createRes = await apiRequest('/api/pages', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                if (!createRes.ok) {
                    const errorText = await createRes.text();
                    throw new Error(`Failed to create page (${createRes.status}): ${errorText}`);
                }
                setMessage('Page created successfully!');
            }

            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto mt-10">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sync Web Development Page</h3>
            <p className="text-gray-500 text-sm mb-6">
                This tool will sync the hardcoded content from <code>webDevelopmentData.js</code> to the database, making it editable in the Admin CMS.
            </p>

            {status === 'idle' && (
                <button
                    onClick={handleSync}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold transition-colors"
                >
                    <RefreshCw size={18} />
                    Sync to Database
                </button>
            )}

            {status === 'syncing' && (
                <div className="flex flex-col items-center justify-center py-4 text-blue-600">
                    <Loader2 size={32} className="animate-spin mb-2" />
                    <p className="text-sm font-medium">{message}</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center justify-center py-4 text-green-600">
                    <CheckCircle size={32} className="mb-2" />
                    <p className="font-bold">Success!</p>
                    <p className="text-sm text-center">{message}</p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-900 underline"
                    >
                        Reset
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center justify-center py-4 text-red-600">
                    <AlertCircle size={32} className="mb-2" />
                    <p className="font-bold">Failed</p>
                    <p className="text-sm text-center">{message}</p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-900 underline"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default SyncWebDevPage;
