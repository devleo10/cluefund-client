import React from 'react';

const EnvDebug: React.FC = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg my-4 text-sm">
      <h3 className="font-bold mb-2">Environment Variables:</h3>
      <div><strong>VITE_BASE_URL:</strong> {import.meta.env.VITE_BASE_URL || 'Not set'}</div>
      <div><strong>VITE_MF_API_URL:</strong> {import.meta.env.VITE_MF_API_URL || 'Not set'}</div>
      <div><strong>VITE_ENV:</strong> {import.meta.env.VITE_ENV || 'Not set'}</div>
      <div><strong>MODE:</strong> {import.meta.env.MODE || 'Not set'}</div>
    </div>
  );
};

export default EnvDebug;
