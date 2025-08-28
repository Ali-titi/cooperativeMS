// src/components/member/LoanApplication.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import { toast } from 'react-toastify';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Calculator,
  TrendingUp
} from 'lucide-react';

const LoanApplication = () => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    repaymentPeriod: '12',
    monthlyIncome: '',
    existingLiabilities: '',
    collateral: '',
    guarantorName: '',
    guarantorPhone: '',
    guarantorAddress: '',
    businessPlan: ''
  });
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loanCalculator, setLoanCalculator] = useState({
    amount: '',
    period: '12',
    rate: 5 // 5% annual interest rate
  });

  useEffect(() => {
    if (currentUser) {
      // Subscribe to user's loans
      const q = query(
        collection(db, 'loans'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const loansData = [];
        querySnapshot.forEach((doc) => {
          loansData.push({ id: doc.id, ...doc.data() });
        });
        setLoans(loansData);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const calculateLoan = () => {
    const principal = parseFloat(loanCalculator.amount) || 0;
    const annualRate = loanCalculator.rate / 100;
    const monthlyRate = annualRate / 12;
    const periods = parseInt(loanCalculator.period);

    if (principal > 0 && periods > 0) {
      const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) / 
                           (Math.pow(1 + monthlyRate, periods) - 1);
      const totalPayment = monthlyPayment * periods;
      const totalInterest = totalPayment - principal;

      return {
        monthlyPayment: monthlyPayment.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
        totalInterest: totalInterest.toFixed(2)
      };
    }
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid loan amount');
      return;
    }

    setLoading(true);

    try {
      const loanData = {
        userId: currentUser.uid,
        memberName: `${userProfile?.firstName} ${userProfile?.lastName}`,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        repaymentPeriod: parseInt(formData.repaymentPeriod),
        monthlyIncome: parseFloat(formData.monthlyIncome),
        existingLiabilities: parseFloat(formData.existingLiabilities) || 0,
        collateral: formData.collateral,
        guarantor: {
          name: formData.guarantorName,
          phone: formData.guarantorPhone,
          address: formData.guarantorAddress
        },
        businessPlan: formData.businessPlan,
        status: 'pending', // pending -> reviewed -> approved/rejected
        createdAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
        approvedBy: null,
        approvedAt: null,
        interestRate: 5, // 5% annual
        ...calculateLoan()
      };

      await addDoc(collection(db, 'loans'), loanData);

      toast.success('Loan application submitted successfully!');
      setShowForm(false);
      
      // Reset form
      setFormData({
        amount: '',
        purpose: '',
        repaymentPeriod: '12',
        monthlyIncome: '',
        existingLiabilities: '',
        collateral: '',
        guarantorName: '',
        guarantorPhone: '',
        guarantorAddress: '',
        businessPlan: ''
      });

    } catch (error) {
      console.error('Error submitting loan application:', error);
      toast.error('Failed to submit loan application. Please try again.');
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
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'reviewed':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculation = calculateLoan();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Applications</h1>
        <p className="text-gray-600">Apply for loans and manage your borrowing needs</p>
      </div>

      {/* Loan Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center mb-4">
              <Calculator className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Loan Calculator</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-2">Loan Amount ($)</label>
                <input
                  type="number"
                  value={loanCalculator.amount}
                  onChange={(e) => setLoanCalculator({...loanCalculator, amount: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-white/50"
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-2">Period (months)</label>
                <select
                  value={loanCalculator.period}
                  onChange={(e) => setLoanCalculator({...loanCalculator, period: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-white/50"
                >
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                </select>
              </div>
              
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-2">Interest Rate</label>
                <div className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white">
                  {loanCalculator.rate}% per year
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Monthly Payment</p>
                <p className="text-2xl font-bold">${calculation.monthlyPayment}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Total Interest</p>
                <p className="text-2xl font-bold">${calculation.totalInterest}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-blue-100 text-sm">Total Payment</p>
                <p className="text-2xl font-bold">${calculation.totalPayment}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
          >
            {showForm ? 'Cancel Application' : 'Apply for Loan'}
          </button>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">Loan Requirements</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Active cooperative membership</li>
              <li>• Minimum 6 months savings history</li>
              <li>• Valid guarantor information</li>
              <li>• Proof of income</li>
              <li>• Clear credit history</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loan Application Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan Application Form</h2>
            <p className="text-gray-600">Fill out all required information for your loan request</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Loan Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount ($) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="100"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter loan amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repayment Period *
                  </label>
                  <select
                    name="repaymentPeriod"
                    required
                    value={formData.repaymentPeriod}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Loan *
                  </label>
                  <textarea
                    name="purpose"
                    required
                    value={formData.purpose}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what you will use this loan for..."
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income ($) *
                  </label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    required
                    min="0"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your monthly income"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Liabilities ($)
                  </label>
                  <input
                    type="number"
                    name="existingLiabilities"
                    min="0"
                    value={formData.existingLiabilities}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Other loans/debts (optional)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collateral/Security
                  </label>
                  <textarea
                    name="collateral"
                    value={formData.collateral}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe any assets you can offer as security..."
                  />
                </div>
              </div>
            </div>

            {/* Guarantor Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guarantor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guarantor Full Name *
                  </label>
                  <input
                    type="text"
                    name="guarantorName"
                    required
                    value={formData.guarantorName}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full name of guarantor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guarantor Phone *
                  </label>
                  <input
                    type="tel"
                    name="guarantorPhone"
                    required
                    value={formData.guarantorPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Guarantor phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guarantor Address *
                  </label>
                  <textarea
                    name="guarantorAddress"
                    required
                    value={formData.guarantorAddress}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Complete address of guarantor"
                  />
                </div>
              </div>
            </div>

            {/* Business Plan (for business loans) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Plan / Usage Plan
                </label>
                <textarea
                  name="businessPlan"
                  value={formData.businessPlan}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="If this is for business, describe your plan. Otherwise, explain how you'll use and repay the loan..."
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                  I agree to the loan terms and conditions, including the 5% annual interest rate and the repayment schedule. 
                  I understand that failure to repay may result in collection actions and affect my cooperative membership.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting Application...
                  </div>
                ) : (
                  'Submit Loan Application'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loan History */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Loan Applications</h2>
          <p className="text-gray-600 text-sm mt-1">Track the status of all your loan applications</p>
        </div>

        <div className="p-6">
          {loans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loan applications</h3>
              <p className="text-gray-500">Apply for your first loan to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(loan.status)}
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          ${loan.amount.toLocaleString()} Loan
                        </h3>
                        <p className="text-sm text-gray-600">{loan.purpose}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Repayment Period:</span>
                      <p className="text-gray-600">{loan.repaymentPeriod} months</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Monthly Payment:</span>
                      <p className="text-gray-600">${loan.monthlyPayment}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Interest Rate:</span>
                      <p className="text-gray-600">{loan.interestRate}% per year</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Applied:</span>
                      <p className="text-gray-600">{loan.createdAt?.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {loan.reviewedBy && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                      <p className="text-blue-800">
                        <span className="font-medium">Reviewed by:</span> {loan.reviewedBy} on {loan.reviewedAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {loan.status === 'rejected' && loan.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                      <p className="text-red-800">
                        <span className="font-medium">Rejection Reason:</span> {loan.rejectionReason}
                      </p>
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

export default LoanApplication;