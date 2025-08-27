// src/components/member/AccountOpening.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '/firebase.config';
import { toast } from 'react-toastify';
import { User, Mail, Phone, MapPin, Calendar, DollarSign, FileText, CheckCircle, Upload } from 'lucide-react';

const AccountOpening = () => {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      dateOfBirth: '',
      nationalId: '',
      occupation: '',
      monthlyIncome: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      address: ''
    },
    accountType: 'savings',
    initialDeposit: '',
    purpose: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create account application
      const applicationData = {
        userId: currentUser.uid,
        ...formData,
        status: 'pending',
        submittedAt: new Date(),
        approvedBy: null,
        approvedAt: null
      };

      await addDoc(collection(db, 'accountApplications'), applicationData);
      
      toast.success('Account application submitted successfully!');
      setApplicationSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (applicationSubmitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Your account opening application has been submitted successfully. The cooperative president will review your application and notify you via email once approved.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">What happens next?</p>
            <ul className="text-blue-700 text-sm mt-2 space-y-1">
              <li>• President reviews your application</li>
              <li>• You'll receive an email notification</li>
              <li>• Once approved, you can start using all features</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.href = '/member'}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-2">Open Cooperative Account</h1>
          <p className="text-primary-100">Join our cooperative community and start your financial journey</p>
        </div>

        {/* Progress Steps */}
        <div className="px-8 py-6 border-b">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Personal Info', icon: User },
              { step: 2, title: 'Emergency Contact', icon: Phone },
              { step: 3, title: 'Account Details', icon: DollarSign },
              { step: 4, title: 'Review & Submit', icon: FileText }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= item.step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= item.step ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {item.title}
                </span>
                {index < 3 && (
                  <div className={`w-16 h-1 ml-4 ${
                    step > item.step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.personalInfo.firstName}
                    onChange={(e) => handleChange('personalInfo', 'firstName', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.personalInfo.lastName}
                    onChange={(e) => handleChange('personalInfo', 'lastName', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.personalInfo.email}
                    onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.personalInfo.phone}
                    onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    required
                    value={formData.personalInfo.address}
                    onChange={(e) => handleChange('personalInfo', 'address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                  <input
                    type="text"
                    required
                    value={formData.personalInfo.nationalId}
                    onChange={(e) => handleChange('personalInfo', 'nationalId', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your national ID number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                  <input
                    type="text"
                    required
                    value={formData.personalInfo.occupation}
                    onChange={(e) => handleChange('personalInfo', 'occupation', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your current occupation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.personalInfo.monthlyIncome}
                    onChange={(e) => handleChange('personalInfo', 'monthlyIncome', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your monthly income"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Emergency Contact */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleChange('emergencyContact', 'name', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Emergency contact name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <select
                    required
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleChange('emergencyContact', 'relationship', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleChange('emergencyContact', 'phone', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Emergency contact phone"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    required
                    value={formData.emergencyContact.address}
                    onChange={(e) => handleChange('emergencyContact', 'address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Emergency contact address"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Account Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="savings">Savings Account</option>
                    <option value="current">Current Account</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Deposit ($)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={formData.initialDeposit}
                    onChange={(e) => setFormData({...formData, initialDeposit: e.target.value})}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Minimum $10"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Account</label>
                  <textarea
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe why you want to open this account and how you plan to use it..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Application</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Account Type:</span> {formData.accountType}</div>
                    <div><span className="font-medium">Initial Deposit:</span> ${formData.initialDeposit}</div>
                  </div>
                  <div className="mt-4">
                    <span className="font-medium text-sm">Purpose:</span>
                    <p className="text-sm text-gray-600 mt-1">{formData.purpose}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">Important Notice:</p>
                <p className="text-blue-700 text-sm mt-1">
                  By submitting this application, you agree to the cooperative's terms and conditions. 
                  Your application will be reviewed by the president and you will be notified via email once approved.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountOpening;

