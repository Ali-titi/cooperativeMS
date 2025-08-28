import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, PiggyBank, CreditCard, TrendingUp, Shield, Award } from 'lucide-react';

const Home = () => {
  const { currentUser, userProfile } = useAuth();

  const features = [
    {
      icon: Users,
      title: "Member Management",
      description: "Streamlined member registration and account management system"
    },
    {
      icon: PiggyBank,
      title: "Savings Management",
      description: "Secure savings deposits and comprehensive record keeping"
    },
    {
      icon: CreditCard,
      title: "Loan Processing",
      description: "Efficient loan application, review, and approval workflow"
    },
    {
      icon: TrendingUp,
      title: "Financial Reports",
      description: "Detailed analytics and financial reporting for better decisions"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-level security with real-time data synchronization"
    },
    {
      icon: Award,
      title: "Role-Based Access",
      description: "Customized dashboards for members, presidents, and accountants"
    }
  ];

  const getDashboardPath = () => {
    if (!userProfile) return '/login';
    return `/${userProfile.role}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-gray-800">
                  CoopManager
                </h1>
            
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="#features" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Features
              </Link>
              <Link to="#about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                About
              </Link>
            </nav>
            <div className="flex space-x-4">
              {currentUser ? (
                <Link
                  to={getDashboardPath()}
                  className="bg-primary-600 text-gray-600 px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Join Us
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors px-4 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Modern Cooperative
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent block">
                Management System
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline your cooperative operations with our comprehensive digital platform. 
              Manage members, savings, loans, and financial records all in one secure place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Link
                  to={getDashboardPath()}
                  className="bg-primary-600 text-gray-700 px-8 py-4 rounded-xl hover:bg-primary-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-black px-8 py-4 rounded-xl hover:bg-primary-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl hover:bg-primary-50 transition-all font-semibold text-lg"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Your Cooperative
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your cooperative efficiently and transparently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Cooperative?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Join hundreds of cooperatives already using our platform to streamline their operations
            </p>
            {!currentUser && (
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold text-lg inline-block shadow-lg"
              >
                Start Your Journey Today
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">CoopManager</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Empowering cooperatives with modern technology solutions
          </p>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500">
              © 2025 CoopManager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;