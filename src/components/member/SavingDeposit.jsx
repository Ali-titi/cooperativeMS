// src/components/member/SavingsDeposit.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '/firebase.config';
import { toast } from 'react-toastify';
import { PiggyBank, DollarSign, Calendar, Receipt, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const SavingsDeposit = () => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    depositMethod: 'cash'
  });
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [stats, setStats] = useState({
    totalSavings: 0,
    thisMonth: 0,
    lastDeposit: 0,
    depositsCount: 0
  });

  useEffect(() => {
    if (currentUser) {
      // Subscribe to user's deposits
      const q = query(
        collection(db, 'savings'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const depositsData = [];
        let total = 0;
        let thisMonth = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        querySnapshot.forEach((doc) => {
          const deposit = { id: doc.id, ...doc.data() };
          depositsData.push(deposit);
          total += deposit.amount;

          const depositDate = deposit.createdAt?.toDate();
          if (depositDate && 
              depositDate.getMonth() === currentMonth && 
              depositDate.getFullYear() === currentYear) {
            thisMonth += deposit.amount;
          }
        });

        setDeposits(depositsData);
        setStats({
          totalSavings: total,
          thisMonth: thisMonth,
          lastDeposit: depositsData.length > 0 ? depositsData[0].amount : 0,
          depositsCount: depositsData.length
        });
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'savings'), {
        userId: currentUser.uid,
        memberName: `${userProfile?.firstName} ${userProfile?.lastName}`,
        amount: parseFloat(formData.amount),
        description: formData.description,
        depositMethod: formData.depositMethod,
        status: 'pending', // Will be confirmed by accountant
        createdAt: new Date(),
        processedBy: null,
        processedAt: null
      });

      toast.success('Deposit request submitted successfully!');
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        depositMethod: 'cash'
      });

    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast.error('Failed to submit deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Savings Deposits</h1>
        <p className="text-gray-600">Manage your savings and track your financial growth</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <span className="text-sm text-green-100">Growing strong</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${stats.thisMonth.toLocaleString()}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Monthly deposits</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Last Deposit</p>
              <p className="text-2xl font-bold text-gray-900">${stats.lastDeposit.toLocaleString()}</p>
            </div>
            <Receipt className="w-8 h-8 text-purple-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Most recent</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.depositsCount}</p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">All time count</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deposit Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Make a Deposit</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Method
                </label>
                <select
                  name="depositMethod"
                  value={formData.depositMethod}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Add a note about this deposit..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Submit Deposit'
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium text-sm">How it works:</p>
              <ul className="text-green-700 text-sm mt-2 space-y-1">
                <li>• Submit your deposit request</li>
                <li>• Accountant reviews and processes</li>
                <li>• Amount is added to your savings</li>
                <li>• You receive confirmation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Deposits History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Deposit History</h2>
              <p className="text-gray-600 text-sm mt-1">Track all your savings deposits</p>
            </div>

            <div className="p-6">
              {deposits.length === 0 ? (
                <div className="text-center py-12">
                  <PiggyBank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deposits yet</h3>
                  <p className="text-gray-500">Make your first deposit to start building your savings!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deposits.map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        {getStatusIcon(deposit.status)}
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            ${deposit.amount.toLocaleString()} - {deposit.depositMethod.replace('_', ' ')}
                          </p>
                          {deposit.description && (
                            <p className="text-sm text-gray-600">{deposit.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {deposit.createdAt?.toDate().toLocaleDateString()} at {deposit.createdAt?.toDate().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(deposit.status)}`}>
                          {deposit.status}
                        </span>
                        {deposit.processedBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            Processed by: {deposit.processedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsDeposit;