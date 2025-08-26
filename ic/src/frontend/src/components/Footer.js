import { useState, useEffect } from "react";
import { Sun, Moon, CheckCircle, Shield, Zap } from "lucide-react";

export default function Footer() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="bg-white dark:bg-gray-900 border-t mt-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-300 gap-4 lg:gap-0">
          {/* Trust indicators */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>24/7 Monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Instant Alerts</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-6">
            <p>© 2025 Canary Contract Guardian</p>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
