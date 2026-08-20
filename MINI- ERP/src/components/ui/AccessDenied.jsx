import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-error-bg rounded-full flex items-center justify-center text-error mb-6">
        <Lock className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
      <p className="text-gray-500 max-w-md mb-8">
        You do not have the required permissions to view this page. Please contact your system administrator if you believe this is a mistake.
      </p>
      <button 
        className="btn btn-primary flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );
};

export default AccessDenied;
