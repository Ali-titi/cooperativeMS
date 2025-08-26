
import Sidebar from "./Sidebar";
import Topbar from "./Header";

export default function MemberLayout({ children }) {
  return (
    <div className="flex max-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 p-4 text-gray-700 dark:text-gray-200">
          {children}
        </main>
      </div>
    </div>
  );
}
