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
  orderBy,
  addDoc,
  getDocs 
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
  Calculator,
  PiggyBank,
  BookOpen,
  DollarSign,
  Plus,
  Eye,
  Edit
} from 'lucide-react';

const AccountantDashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [savingsDeposits, setSavingsDeposits] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    pendingLoans: 0,
    reviewedLoans: 0,
    totalSavings: 0,
    totalMembers: 0
  });
  const location = useLocation();

  const navigation = [
    { 
      name: 'Overview', 
      href: '/accountant', 
      icon: TrendingUp, 
      current: location.pathname === '/accountant' 
    },
    { 
      name: 'Loan Review', 
      href: '/accountant/loans', 
      icon: CreditCard, 
      current: location.pathname === '/accountant/loans',
      badge: stats.pendingLoans
    },
    { 
      name: 'Savings Management', 
      href: '/accountant/savings', 
      icon: PiggyBank, 
      current: location.pathname === '/accountant/savings' 
    },
    { 
      name: 'Loan Records', 
      href: '/accountant/loan-records', 
      icon: BookOpen, 
      current: location.pathname === '/accountant/loan-records' 
    },
    { 
      name: 'Savings Records', 
      href: '/accountant/savings-records', 
      icon: FileText, 
      current: location.pathname === '/accountant/savings-records' 
    },
    { 
      name: 'Calculator', 
      href: '/accountant/calculator', 
      icon: Calculator, 
      current: location.pathname === '/accountant/calculator' 
    },
    { 
      name: 'Settings', 
      href: '/accountant/settings', 
      icon: Settings, 
      current: location.pathname === '/accountant/settings' 
    },
  ];

  useEffect(() => {
    // Subscribe to pending loan applications (submitted by members)
    const pendingLoansQuery = query(
      collection(db, 'loans'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribePendingLoans = onSnapshot(pendingLoansQuery, (snapshot) => {
      const loans = [];
      snapshot.forEach(doc => {
        loans.push({ id: doc.id, ...doc.data() });
      });
      setPendingLoans(loans);
    });

    // Subscribe to all loans
    const allLoansQuery = query(
      collection(db, 'loans'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeAllLoans = onSnapshot(allLoansQuery, (snapshot) => {
      const loans = [];
      snapshot.forEach(doc => {
        loans.push({ id: doc.id, ...doc.data() });
      });
      setAllLoans(loans);
    });

    // Subscribe to savings deposits
    const savingsQuery = query(
      collection(db, 'savingsDeposits'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeSavings = onSnapshot(savingsQuery, (snapshot) => {
      const deposits = [];
      snapshot.forEach(doc => {
        deposits.push({ id: doc.id, ...doc.data() });
      });
      setSavingsDeposits(deposits);
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
      unsubscribePendingLoans();
      unsubscribeAllLoans();
      unsubscribeSavings();
      unsubscribeMembers();
    };
  }, []);

  useEffect(() => {
    // Update stats
    const totalSavings = savingsDeposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
    const reviewedLoans = allLoans.filter(loan => loan.status === 'reviewed').length;

    setStats({
      pendingLoans: pendingLoans.length,
      reviewedLoans,
      totalSavings,
      totalMembers: members.length
    });
  }, [pendingLoans, allLoans, savingsDeposits, members]);

  const handleLoanReview = async (loanId, approved, rejectionReason = '') => {
    try {
      const loanRef = doc(db, 'loans', loanId);
      const updateData = {
        status: approved ? 'reviewed' : 'rejected',
        reviewedBy: `${userProfile?.firstName} ${userProfile?.lastName}`,
        reviewedAt: new Date(),
      };

      if (!approved && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      await updateDoc(loanRef, updateData);

      toast.success(approved ? 'Loan approved and sent to President!' : 'Loan application rejected!');
    } catch (error) {
      console.error('Error reviewing loan:', error);
      toast.error('Failed to update loan status');
    }
  };

  const handleLoanApproval = async (loanId, approved, rejectionReason = '') => {
    try {
      const loanRef = doc(db, 'loans', loanId);
      const updateData = {
        status: approved ? 'approved' : 'rejected',
        approvedBy: `${userProfile?.firstName} ${userProfile?.lastName} (Accountant)`,
        approvedAt: new Date(),
      };

      if (!approved && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      await updateDoc(loanRef, updateData);

      toast.success(approved ? 'Loan approved successfully! Member will be notified.' : 'Loan rejected successfully!');
    } catch (error) {
      console.error('Error approving loan:', error);
      toast.error('Failed to update loan status');
    }
  };

  const handleSavingsDeposit = async (depositData) => {
    try {
      await addDoc(collection(db, 'savingsDeposits'), {
        ...depositData,
        recordedBy: `${userProfile?.firstName} ${userProfile?.lastName}`,
        createdAt: new Date(),
      });

      toast.success('Savings deposit recorded successfully!');
    } catch (error) {
      console.error('Error recording savings deposit:', error);
      toast.error('Failed to record savings deposit');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const AccountantOverview = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, Accountant {userProfile?.firstName}.
        </h1>
        <p className="text-gray-600">Manage loan reviews and savings deposits for the cooperative</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Pending Loans</p>
              <p className="text-3xl font-bold">{stats.pendingLoans}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center">
            <CreditCard className="w-4 h-4 mr-1" />
            <span className="text-sm text-purple-100">Awaiting review</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Reviewed Loans</p>
              <p className="text-3xl font-bold text-green-600">{stats.reviewedLoans}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">Sent to President</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Savings</p>
              <p className="text-3xl font-bold">${stats.totalSavings.toLocaleString()}</p>
            </div>
            <PiggyBank className="w-8 h-8 text-green-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm text-green-100">Member deposits</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Members</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalMembers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-blue-600 font-medium">Active accounts</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pending Loan Reviews */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Loan Applications to Review</h2>
            <Link 
              to="/accountant/loans"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {pendingLoans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending loan applications</p>
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
                      title="Approve Directly"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLoanReview(loan.id, true)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Send to President"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLoanReview(loan.id, false, 'Application rejected by accountant after review')}
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

        {/* Recent Savings Deposits */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Savings Deposits</h2>
            <Link 
              to="/accountant/savings"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Add New
            </Link>
          </div>
          
          {savingsDeposits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No savings deposits yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savingsDeposits.slice(0, 5).map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50">
                  <div>
                    <p className="font-medium text-gray-900">
                      {deposit.memberName}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${deposit.amount?.toLocaleString()} - {deposit.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {deposit.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/accountant/loans"
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Review Loans</h3>
              <p className="text-sm text-gray-600 mt-1">Evaluate loan applications</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-500 group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/accountant/savings"
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Savings</h3>
              <p className="text-sm text-gray-600 mt-1">Record member deposits</p>
            </div>
            <PiggyBank className="w-8 h-8 text-green-500 group-hover:text-green-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/accountant/loan-records"
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Loan Records</h3>
              <p className="text-sm text-gray-600 mt-1">View loan history</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/accountant/calculator"
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Calculator</h3>
              <p className="text-sm text-gray-600 mt-1">Financial calculations</p>
            </div>
            <Calculator className="w-8 h-8 text-orange-500 group-hover:text-orange-600 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">Accountant Portal</span>
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
                      ? 'bg-purple-50 border-r-2 border-purple-500 text-purple-700'
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
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">CoopManager</span>
              <p className="text-xs text-purple-600 font-medium">Accountant Portal</p>
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
                    ? 'bg-purple-100 text-purple-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className={`w-5 h-5 mr-3 ${item.current ? 'text-purple-500' : 'text-gray-400'}`} />
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
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.firstName} {userProfile?.lastName}
                </p>
                <p className="text-xs text-purple-600 font-medium">Accountant</p>
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
                {stats.pendingLoans > 0 && (
                  <Link
                    to="/accountant/loans"
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium hover:bg-purple-200"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{stats.pendingLoans} loans to review</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<AccountantOverview />} />
            <Route 
              path="/loans" 
              element={
                <LoanReview 
                  loans={pendingLoans}
                  onReview={handleLoanReview}
                />
              } 
            />
            <Route 
              path="/savings" 
              element={
                <SavingsManagement 
                  members={members}
                  onDeposit={handleSavingsDeposit}
                />
              } 
            />
            <Route 
              path="/loan-records" 
              element={<LoanRecords loans={allLoans} />} 
            />
            <Route 
              path="/savings-records" 
              element={<SavingsRecords deposits={savingsDeposits} />} 
            />
            <Route 
              path="/calculator" 
              element={<FinancialCalculator />} 
            />
            <Route 
              path="/settings" 
              element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Accountant Settings</h2><p className="text-gray-600 mt-2">Configure your accountant preferences and settings.</p></div>} 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Loan Review Component
const LoanReview = ({ loans, onReview }) => {
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  const handleReject = (loanId) => {
    onReview(loanId, false, rejectionReason);
    setShowRejectModal(null);
    setRejectionReason('');
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Application Review</h1>
        <p className="text-gray-600">Review and evaluate loan applications from members</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Pending Applications</h2>
            <span className="text-sm text-gray-500">{loans.length} applications</span>
          </div>
        </div>

        <div className="p-6">
          {loans.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All reviews complete!</h3>
              <p className="text-gray-500">No pending loan applications to review.</p>
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
                      onClick={() => handleLoanReview(loan.id, true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Send to President
                    </button>
                    <button
                      onClick={() => handleLoanApproval(loan.id, true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Approve Directly
                    </button>
                    <button
                      onClick={() => setShowRejectModal(loan.id)}
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
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Loan Application</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowRejectModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Savings Management Component
const SavingsManagement = ({ members, onDeposit }) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositType, setDepositType] = useState('regular');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember || !depositAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const member = members.find(m => m.id === selectedMember);
      await onDeposit({
        memberId: selectedMember,
        memberName: `${member.firstName} ${member.lastName}`,
        memberEmail: member.email,
        amount: parseFloat(depositAmount),
        type: depositType,
        notes,
      });

      // Reset form
      setSelectedMember('');
      setDepositAmount('');
      setDepositType('regular');
      setNotes('');
    } catch (error) {
      console.error('Error submitting deposit:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Savings Management</h1>
        <p className="text-gray-600">Record and manage member savings deposits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Record New Deposit</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Member *
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Choose a member...</option>
                {members.filter(member => member.status === 'active').map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} - {member.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Type
              </label>
              <select
                value={depositType}
                onChange={(e) => setDepositType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="regular">Regular Savings</option>
                <option value="emergency">Emergency Fund</option>
                <option value="special">Special Contribution</option>
                <option value="penalty">Penalty Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this deposit..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Recording...' : 'Record Deposit'}
            </button>
          </form>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Members</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {members.filter(member => member.status === 'active').map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMember(member.id)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Deposit Types</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Regular Savings</span>
                <span>Standard deposits</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Fund</span>
                <span>Crisis reserves</span>
              </div>
              <div className="flex justify-between">
                <span>Special Contribution</span>
                <span>Project funding</span>
              </div>
              <div className="flex justify-between">
                <span>Penalty Payment</span>
                <span>Late fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loan Records Component
const LoanRecords = ({ loans }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLoans = loans.filter(loan => {
    const matchesFilter = filter === 'all' || loan.status === filter;
    const matchesSearch = loan.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    disbursed: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Records</h1>
        <p className="text-gray-600">Complete history of all loan applications and their status</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="disbursed">Disbursed</option>
            </select>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by member name or purpose..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Loan History ({filteredLoans.length} records)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {loan.memberName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${loan.amount?.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {loan.purpose}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-800'}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      Applied: {loan.createdAt?.toDate().toLocaleDateString()}
                    </div>
                    {loan.reviewedAt && (
                      <div>
                        Reviewed: {loan.reviewedAt?.toDate().toLocaleDateString()}
                      </div>
                    )}
                    {loan.approvedAt && (
                      <div>
                        Approved: {loan.approvedAt?.toDate().toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-purple-600 hover:text-purple-900">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Savings Records Component
const SavingsRecords = ({ deposits }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.memberName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || deposit.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalSavings = filteredDeposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Savings Records</h1>
        <p className="text-gray-600">Complete history of all member savings deposits</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Savings</p>
              <p className="text-3xl font-bold">${totalSavings.toLocaleString()}</p>
            </div>
            <PiggyBank className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
              <p className="text-3xl font-bold text-blue-600">{filteredDeposits.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Average Deposit</p>
              <p className="text-3xl font-bold text-purple-600">
                ${filteredDeposits.length ? Math.round(totalSavings / filteredDeposits.length).toLocaleString() : 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="regular">Regular Savings</option>
              <option value="emergency">Emergency Fund</option>
              <option value="special">Special Contribution</option>
              <option value="penalty">Penalty Payment</option>
            </select>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by member name..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-80"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Savings History ({filteredDeposits.length} transactions)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recorded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {deposit.memberName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {deposit.memberEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ${deposit.amount?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {deposit.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deposit.createdAt?.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deposit.recordedBy}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {deposit.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Financial Calculator Component
const FinancialCalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [results, setResults] = useState(null);

  const calculateLoan = () => {
    if (!loanAmount || !interestRate || !loanTerm) {
      toast.error('Please fill in all fields');
      return;
    }

    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const months = parseInt(loanTerm);
    
    const monthlyRate = annualRate / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      principal: principal.toFixed(2)
    });
  };

  const clearCalculator = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTerm('');
    setResults(null);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Calculator</h1>
        <p className="text-gray-600">Calculate loan payments and interest for member applications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Loan Calculator</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount ($)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="10000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="12"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term (months)
              </label>
              <input
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                placeholder="24"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={calculateLoan}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium"
              >
                Calculate
              </button>
              <button
                onClick={clearCalculator}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Calculation Results</h2>
          
          {results ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <h3 className="text-sm font-medium text-purple-100 mb-1">Monthly Payment</h3>
                <p className="text-2xl font-bold">${parseFloat(results.monthlyPayment).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Principal</h4>
                  <p className="text-lg font-semibold text-blue-900">
                    ${parseFloat(results.principal).toLocaleString()}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-800 mb-1">Total Interest</h4>
                  <p className="text-lg font-semibold text-green-900">
                    ${parseFloat(results.totalInterest).toLocaleString()}
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-orange-800 mb-1">Total Payment</h4>
                  <p className="text-lg font-semibold text-orange-900">
                    ${parseFloat(results.totalPayment).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Payment:</span>
                    <span className="font-medium">${parseFloat(results.monthlyPayment).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Payments:</span>
                    <span className="font-medium">{loanTerm} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-medium">{interestRate}% annually</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Cost of Loan:</span>
                    <span className="font-semibold">${parseFloat(results.totalPayment).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Enter loan details to calculate</p>
              <p className="text-sm">Fill in the form on the left to see payment calculations</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Reference</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Standard Rate</h3>
            <p className="text-2xl font-bold text-blue-600">12%</p>
            <p className="text-sm text-blue-700">Annual interest</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Max Term</h3>
            <p className="text-2xl font-bold text-green-600">36</p>
            <p className="text-sm text-green-700">Months</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Min Amount</h3>
            <p className="text-2xl font-bold text-purple-600">$500</p>
            <p className="text-sm text-purple-700">Minimum loan</p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">Max Amount</h3>
            <p className="text-2xl font-bold text-orange-600">$50K</p>
            <p className="text-sm text-orange-700">Maximum loan</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Calculation Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Calculations use standard compound interest formula</li>
            <li>• Monthly payments include both principal and interest</li>
            <li>• Actual rates may vary based on member creditworthiness</li>
            <li>• Use these calculations for preliminary assessment only</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;