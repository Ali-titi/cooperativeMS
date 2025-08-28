// src/components/president/PresidentDashboard.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  orderBy 
} from 'firebase/firestore';
import { db } from '/firebase.config';
import { toast } from 'react-toastify';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  Menu, 
  X,
  User,
  Settings,
  FileText,
  Shield,
  BarChart3
} from 'lucide-react';

const PresidentDashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingAccounts: 0,
    pendingLoans: 0,
    approvedLoans: 0
  });
  const location = useLocation();

  const navigation = [
    { 
      name: 'Overview', 
      href: '/president', 
      icon: TrendingUp, 
      current: location.pathname === '/president' 
    },
    { 
      name: 'Account Approvals', 
      href: '/president/accounts', 
      icon: Users, 
      current: location.pathname === '/president/accounts',
      badge: stats.pendingAccounts
    },
    { 
      name: 'Loan Approvals', 
      href: '/president/loans', 
      icon: CreditCard, 
      current: location.pathname === '/president/loans',
      badge: stats.pendingLoans
    },
    { 
      name: 'Members', 
      href: '/president/members', 
      icon: User, 
      current: location.pathname === '/president/members' 
    },
    { 
      name: 'Reports', 
      href: '/president/reports', 
      icon: BarChart3, 
      current: location.pathname === '/president/reports' 
    },
    { 
      name: 'Settings', 
      href: '/president/settings', 
      icon: Settings, 
      current: location.pathname === '/president/settings' 
    },
  ];

  useEffect(() => {
    // Subscribe to pending account applications
    const accountsQuery = query(
      collection(db, 'accountApplications'),
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribeAccounts = onSnapshot(accountsQuery, (snapshot) => {
      const accounts = [];
      snapshot.forEach(doc => {
        accounts.push({ id: doc.id, ...doc.data() });
      });
      setPendingAccounts(accounts);
    });

    // Subscribe to pending loans
    const loansQuery = query(
      collection(db, 'loans'),
      where('status', '==', 'reviewed'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeLoans = onSnapshot(loansQuery, (snapshot) => {
      const loans = [];
      snapshot.forEach(doc => {
        loans.push({ id: doc.id, ...doc.data() });
      });
      setPendingLoans(loans);
    });

    // Subscribe to all members
    const membersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'member')
    );

    const unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
      const membersData = [];
      snapshot.forEach(doc => {
        membersData.push({ id: doc.id, ...doc.data() });
      });
      setMembers(membersData);
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeLoans();
      unsubscribeMembers();
    };
  }, []);

  useEffect(() => {
    // Update stats
    setStats({
      totalMembers: members.length,
      pendingAccounts: pendingAccounts.length,
      pendingLoans: pendingLoans.length,
      approvedLoans: members.filter(m => m.status === 'active').length
    });
  }, [members, pendingAccounts, pendingLoans]);

  const handleAccountApproval = async (accountId, approved, rejectionReason = '') => {
    try {
      const accountRef = doc(db, 'accountApplications', accountId);
      const updateData = {
        status: approved ? 'approved' : 'rejected',
        approvedBy: `${userProfile?.firstName} ${userProfile?.lastName}`,
        approvedAt: new Date(),
      };

      if (!approved && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      await updateDoc(accountRef, updateData);

      // If approved, also update user status
      if (approved) {
        const account = pendingAccounts.find(acc => acc.id === accountId);
        if (account) {
          const userRef = doc(db, 'users', account.userId);
          await updateDoc(userRef, { status: 'active' });
        }
      }

      toast.success(approved ? 'Account approved successfully!' : 'Account rejected successfully!');
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account status');
    }
  };

  const handleLoanApproval = async (loanId, approved, rejectionReason = '') => {
    try {
      const loanRef = doc(db, 'loans', loanId);
      const updateData = {
        status: approved ? 'approved' : 'rejected',
        approvedBy: `${userProfile?.firstName} ${userProfile?.lastName}`,
        approvedAt: new Date(),
      };

      if (!approved && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      await updateDoc(loanRef, updateData);

      toast.success(approved ? 'Loan approved successfully!' : 'Loan rejected successfully!');
    } catch (error) {
      console.error('Error updating loan:', error);
      toast.error('Failed to update loan status');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const PresidentOverview = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, President {userProfile?.firstName}!
        </h1>
        <p className="text-gray-600">Manage your cooperative operations and approvals</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Members</p>
              <p className="text-3xl font-bold">{stats.totalMembers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm text-blue-100">Active community</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Accounts</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingAccounts}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="mt-4">
            <Link 
              to="/president/accounts"
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Review applications →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Loans</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingLoans}</p>
            </div>
            <CreditCard className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-4">
            <Link 
              to="/president/loans"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Review loans →
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Members</p>
              <p className="text-3xl font-bold">{stats.approvedLoans}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
          <div className="mt-4 flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            <span className="text-sm text-green-100">Approved accounts</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pending Account Approvals */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Account Applications</h2>
            <Link 
              to="/president/accounts"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {pendingAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending account applications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAccounts.slice(0, 3).map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {account.personalInfo?.firstName} {account.personalInfo?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{account.personalInfo?.email}</p>
                    <p className="text-xs text-gray-500">
                      Applied: {account.submittedAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAccountApproval(account.id, true)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAccountApproval(account.id, false, 'Application rejected by president')}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Loan Approvals */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Loan Applications for Review</h2>
            <Link 
              to="/president/loans"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {pendingLoans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No loans pending approval</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {loan.memberName} - ${loan.amount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">{loan.purpose}</p>
                    <p className="text-xs text-gray-500">
                      Applied: {loan.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleLoanApproval(loan.id, true)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLoanApproval(loan.id, false, 'Loan rejected by president')}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* This would be populated with recent approvals, rejections, etc. */}
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Activity history will appear here</p>
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">President Portal</span>
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
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium ${
                    item.current
                      ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">CoopManager</span>
              <p className="text-xs text-blue-600 font-medium">President Portal</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className={`w-5 h-5 mr-3 ${item.current ? 'text-blue-500' : 'text-gray-400'}`} />
                  {item.name}
                </div>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.firstName} {userProfile?.lastName}
                </p>
                <p className="text-xs text-blue-600 font-medium">President</p>
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
              <div className="hidden md:flex items-center space-x-4">
                {stats.pendingAccounts > 0 && (
                  <Link
                    to="/president/accounts"
                    className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium hover:bg-yellow-200"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{stats.pendingAccounts} pending accounts</span>
                  </Link>
                )}
                {stats.pendingLoans > 0 && (
                  <Link
                    to="/president/loans"
                    className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium hover:bg-orange-200"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{stats.pendingLoans} pending loans</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<PresidentOverview />} />
            <Route 
              path="/accounts" 
              element={
                <AccountApprovals 
                  accounts={pendingAccounts}
                  onApproval={handleAccountApproval}
                />
              } 
            />
            <Route 
              path="/loans" 
              element={
                <LoanApprovals 
                  loans={pendingLoans}
                  onApproval={handleLoanApproval}
                />
              } 
            />
            <Route 
              path="/members" 
              element={<MemberManagement members={members} />} 
            />
            <Route 
              path="/reports" 
              element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2><p className="text-gray-600 mt-2">Financial reports and cooperative analytics will be displayed here.</p></div>} 
            />
            <Route 
              path="/settings" 
              element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">System Settings</h2><p className="text-gray-600 mt-2">Configure cooperative settings and preferences.</p></div>} 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Account Approvals Component
const AccountApprovals = ({ accounts, onApproval }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Approvals</h1>
        <p className="text-gray-600">Review and approve new member account applications</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Pending Applications</h2>
            <span className="text-sm text-gray-500">{accounts.length} applications</span>
          </div>
        </div>

        <div className="p-6">
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No pending account applications at this time.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {accounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {account.personalInfo?.firstName} {account.personalInfo?.lastName}
                      </h3>
                      <p className="text-gray-600">{account.personalInfo?.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied: {account.submittedAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        {selectedAccount === account.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        onClick={() => onApproval(account.id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onApproval(account.id, false, 'Application rejected by president')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {selectedAccount === account.id && (
                    <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Phone:</span> {account.personalInfo?.phone}</div>
                            <div><span className="font-medium">Address:</span> {account.personalInfo?.address}</div>
                            <div><span className="font-medium">Date of Birth:</span> {account.personalInfo?.dateOfBirth}</div>
                            <div><span className="font-medium">National ID:</span> {account.personalInfo?.nationalId}</div>
                            <div><span className="font-medium">Occupation:</span> {account.personalInfo?.occupation}</div>
                            <div><span className="font-medium">Monthly Income:</span> ${account.personalInfo?.monthlyIncome}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Name:</span> {account.emergencyContact?.name}</div>
                            <div><span className="font-medium">Relationship:</span> {account.emergencyContact?.relationship}</div>
                            <div><span className="font-medium">Phone:</span> {account.emergencyContact?.phone}</div>
                            <div><span className="font-medium">Address:</span> {account.emergencyContact?.address}</div>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-900 mb-3">Account Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-medium">Account Type:</span> {account.accountType}</div>
                            <div><span className="font-medium">Initial Deposit:</span> ${account.initialDeposit}</div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium text-sm">Purpose:</span>
                            <p className="text-sm text-gray-600 mt-1">{account.purpose}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Loan Approvals Component
const LoanApprovals = ({ loans, onApproval }) => {
  const [selectedLoan, setSelectedLoan] = useState(null);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Approvals</h1>
        <p className="text-gray-600">Review and approve loan applications that have been vetted by the accountant</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Loans for Final Approval</h2>
            <span className="text-sm text-gray-500">{loans.length} loans</span>
          </div>
        </div>

        <div className="p-6">
          {loans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loans pending approval</h3>
              <p className="text-gray-500">Loans will appear here after accountant review.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {loans.map((loan) => (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {loan.memberName} - ${loan.amount?.toLocaleString()}
                      </h3>
                      <p className="text-gray-600">{loan.purpose}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Applied: {loan.createdAt?.toDate().toLocaleDateString()}</span>
                        <span>Period: {loan.repaymentPeriod} months</span>
                        <span>Monthly Payment: ${loan.monthlyPayment}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedLoan(selectedLoan === loan.id ? null : loan.id)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        {selectedLoan === loan.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        onClick={() => onApproval(loan.id, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onApproval(loan.id, false, 'Loan rejected by president after review')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {selectedLoan === loan.id && (
                    <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Financial Details</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Monthly Income:</span> ${loan.monthlyIncome?.toLocaleString()}</div>
                            <div><span className="font-medium">Existing Liabilities:</span> ${loan.existingLiabilities?.toLocaleString()}</div>
                            <div><span className="font-medium">Interest Rate:</span> {loan.interestRate}% per annum</div>
                            <div><span className="font-medium">Total Interest:</span> ${loan.totalInterest}</div>
                            <div><span className="font-medium">Total Payment:</span> ${loan.totalPayment}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Guarantor Information</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Name:</span> {loan.guarantor?.name}</div>
                            <div><span className="font-medium">Phone:</span> {loan.guarantor?.phone}</div>
                            <div><span className="font-medium">Address:</span> {loan.guarantor?.address}</div>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-900 mb-3">Business Plan / Usage Plan</h4>
                          <p className="text-sm text-gray-600">{loan.businessPlan}</p>
                        </div>

                        {loan.collateral && (
                          <div className="md:col-span-2">
                            <h4 className="font-semibold text-gray-900 mb-3">Collateral</h4>
                            <p className="text-sm text-gray-600">{loan.collateral}</p>
                          </div>
                        )}

                        {loan.reviewedBy && (
                          <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-blue-800 font-medium text-sm">Accountant Review:</p>
                            <p className="text-blue-700 text-sm">Reviewed and recommended by: {loan.reviewedBy}</p>
                            <p className="text-blue-600 text-xs">Reviewed on: {loan.reviewedAt?.toDate().toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Member Management Component
const MemberManagement = ({ members }) => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Management</h1>
        <p className="text-gray-600">View and manage all cooperative members</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">All Members</h2>
            <span className="text-sm text-gray-500">{members.length} members</span>
          </div>
        </div>

        <div className="p-6">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
              <p className="text-gray-500">Members will appear here once their accounts are approved.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.phone}</div>
                        <div className="text-sm text-gray-500">{member.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.createdAt?.toDate().toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresidentDashboard;