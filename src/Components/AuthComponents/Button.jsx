export default function Button({ label, isLoading, disabled, type = "button" }) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className="w-full bg-blue-600 text-white py-1.5 text-sm rounded hover:bg-blue-700 transition disabled:opacity-50"
    >
      {isLoading ? label.loading : label.default}
    </button>
  );
}
