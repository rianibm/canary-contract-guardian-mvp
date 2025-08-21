// notification
import React, { useEffect } from 'react';

function Toast({ message, type, onClose }) {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🚨';
  
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in max-w-sm`}>
      <div className="flex items-center">
        <span className="mr-2 text-lg">{icon}</span>
        <span className="font-medium flex-1">{message}</span>
        <button 
          onClick={onClose} 
          className="ml-4 text-white hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 w-full bg-white bg-opacity-20 rounded-full h-1">
        <div className="bg-white h-1 rounded-full animate-progress"></div>
      </div>
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-progress {
          animation: progress 4s linear;
        }
      `}</style>
    </div>
  );
}

export default Toast;