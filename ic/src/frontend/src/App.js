// import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Test Tailwind Utilities */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 border">
        
        {/* Test Typography */}
        <h1 className="text-3xl font-bold text-orange-600 mb-4 font-sans">
          🐦 Canary Contract Guardian
        </h1>
        
        <p className="text-sm text-gray-600 mb-4 font-medium">
          Smart contract monitoring made simple
        </p>
        
        {/* Test Button with Hover */}
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
          Start Monitoring
        </button>
        
        {/* Test Spacing & Layout */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-green-100 p-3 rounded text-center">
            <span className="text-green-700 font-bold">Active</span>
          </div>
          <div className="bg-red-100 p-3 rounded text-center">
            <span className="text-red-700 font-bold">Alerts</span>
          </div>
        </div>
        
        {/* Test More Utilities */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs uppercase tracking-wide text-gray-500">Status</span>
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono">Online</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default App;

