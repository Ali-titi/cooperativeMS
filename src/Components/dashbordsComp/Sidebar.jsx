import React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaMoneyBill, FaChartBar, FaCog, FaSignOutAlt, FaUserEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Member menu links
  const menuItems = [
    { path: "/member/dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/member/savings", label: "Profile", icon: <FaUserEdit /> },
    { path: "/member/loans", label: "Saving", icon: <FaMoneyBill /> },
    { path: "/member/reports", label: "Reports", icon: <FaChartBar /> },
    { path: "/member/settings", label: "Settings", icon: <FaCog /> },
  ];

   const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className=" relative h-screen w-52 bg-white text-gray-700 flex flex-col">
      <div className="a border-b border-gray-200 font-bold text-[#005c99] flex items-center">
        <img src="logo.png" alt="" className="w-[60px]" />
       <h1>COOPERATIVE.</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 text-sm transition ${
              location.pathname === item.path
                ? "bg-blue-900"
                : "hover:bg-[#005c99] hover:text-white"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className=" border-t border-gray-200">
        <button className="flex p-4 items-center gap-3 w-full text-left hover:bg-[#005c99] hover:text-white"  onClick={handleLogout} >
          <FaSignOutAlt /> <span>Logout</span> 
        </button>
      </div>
    </div>
  );
}
