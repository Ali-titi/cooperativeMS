export default function Card({ title, value, color }) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 ${color}`}>
      <h3 className="text-sm text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
