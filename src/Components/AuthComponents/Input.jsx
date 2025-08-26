import { useState } from "react";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";

export default function Input({ label, type, value, onChange, icon, placeholder, required }) {
  const [visible, setVisible] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  return (
    <div className="space-y-1">
      {label && <label className="flex flex-start text-xs font-medium text-gray-600">{label}</label>}
      <div className="relative flex items-center">
        {icon && <div className="mt-1 absolute left-3 text-gray-500 text-sm">{icon}</div>}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="mt-1 w-full pl-9 pr-3 py-1.5 text-sm border border-gray-500 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-500"
        />
        {isPassword && (
          <div
            className="mt-1 absolute right-3 text-gray-500 text-sm cursor-pointer"
            onClick={() => setVisible(!visible)}
          >
            {visible ? <FaEye /> : <FaRegEyeSlash />}
          </div>
        )}
      </div>
    </div>
  );
}
