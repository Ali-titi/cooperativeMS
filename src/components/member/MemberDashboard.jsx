// src/components/member/MemberDashboard.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  PiggyBank, 
  CreditCard, 
  History, 
  User, 
  Menu, 
  X, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import AccountOpening from './AccountOpening';
import SavingsDeposit from './SavingDeposit';
import LoanApplication from './LoanApplication';

const MemberDashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalSavings: 0,
    activeLoans: 0,
    pendingApplications: 1,
    accountStatus: 'pending'
  });
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/member', icon: TrendingUp, current: location.pathname === '/member' },
    { name: 'Open Account', href: '/member/account', icon: User, current: location.pathname === '/member/account' },
    { name: 'Savings', href: '/member/savings', icon: PiggyBank, current: location.pathname === '/member/savings' },
    { name: 'Loans', href: '/member/loans', icon: CreditCard, current: location.pathname === '/member/loans' },
    { name: 'History', href: '/member/history', icon: History, current: location.pathname === '/member/history' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const MemberOverview = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userProfile?.firstName || 'Member'}!
        </h1>
        <p className="text-gray-600">Here's your cooperative account overview</p>
      </div>

      {/* Account Status Alert */}
      {stats.accountStatus === 'pending' && (
        <div className="mb-6 bg-accent-50 border border-accent-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-accent-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-accent-800">Account Pending Approval</h3>
              <p className="text-sm text-accent-700 mt-1">
                Your account is waiting for approval from the cooperative president. You can still browse the system.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalSavings.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-secondary-500 mr-1" />
            <span className="text-sm text-secondary-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeLoans}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="w-4 h-4 text-primary-500 mr-1" />
            <span className="text-sm text-primary-600">All payments up to date</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-accent-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <AlertCircle className="w-4 h-4 text-accent-500 mr-1" />
            <span className="text-sm text-accent-600">Account approval pending</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Account Status</p>
              <p className="text-lg font-bold text-accent-600 capitalize">{stats.accountStatus}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Member since 2024</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/member/account"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900 group-hover:text-primary-900">Open Account</p>
              <p className="text-sm text-gray-500">Start your cooperative journey</p>
            </div>
          </Link>
          
          <Link
            to="/member/savings"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all group"
          >
            <PiggyBank className="w-8 h-8 text-gray-400 group-hover:text-secondary-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900 group-hover:text-secondary-900">Make Deposit</p>
              <p className="text-sm text-gray-500">Add to your savings</p>
            </div>
          </Link>
          
          <Link
            to="/member/loans"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all group"
          >
            <CreditCard className="w-8 h-8 text-gray-400 group-hover:text-accent-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900 group-hover:text-accent-900">Apply for Loan</p>
              <p className="text-sm text-gray-500">Get financial assistance</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Account Application Submitted</p>
                <p className="text-sm text-gray-500">Waiting for president approval</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">2 days ago</span>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>More activity will appear here once your account is approved</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">CoopManager</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <nav className="mt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    item.current
                      ? 'bg-primary-50 border-r-2 border-primary-500 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-white lg:shadow-xl">
        <div className="flex items-center justify-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">CoopManager</span>
              <p className="text-xs text-gray-500">Member Portal</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${item.current ? 'text-primary-500' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.firstName} {userProfile?.lastName}
                </p>
                <p className="text-xs text-gray-500">{userProfile?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => item.current)?.name || 'Overview'}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stats.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {stats.accountStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<MemberOverview />} />
            <Route path="/account" element={<AccountOpening />} />
            <Route path="/savings" element={<SavingsDeposit />} />
            <Route path="/loans" element={<LoanApplication />} />
            <Route path="/history" element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Transaction History</h2><p className="text-gray-600 mt-2">Your transaction history will appear here once your account is approved.</p></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard;