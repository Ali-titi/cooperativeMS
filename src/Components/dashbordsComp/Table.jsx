// components/Table.jsx
export default function Table({ columns, data }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-700">
            {columns.map((col, index) => (
              <th key={index} className="py-2">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
