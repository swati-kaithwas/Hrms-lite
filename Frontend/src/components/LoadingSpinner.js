import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center min-h-80 gap-4">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}

export default LoadingSpinner;
