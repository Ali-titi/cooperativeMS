import { useState, useEffect } from "react";
import { FaBell, FaUserCircle, FaMoon, FaSun } from "react-icons/fa";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Handle toggle
  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 shadow px-4 py-2 flex justify-between items-center">
      
      <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
        Member Dashboard
      </h1>

      <div className="flex items-center gap-4">
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        
        <button className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          <FaBell />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1">
            3
          </span>
        </button>
        <button className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <FaUserCircle size={24} />
          <span className="hidden sm:inline">Member</span>
        </button>
      </div>
    </div>
  );
}
