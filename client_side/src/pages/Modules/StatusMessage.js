import React from 'react';

// Component to display status messages (notifications, errors, loading)
const StatusMessages = ({ notification, error, isLoading }) => {
  return (
    <div className="w-full mb-4">
      {/* Notification message */}
      {notification && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded">
          {notification}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 border border-blue-200 rounded flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      )}
    </div>
  );
};

export default StatusMessages;