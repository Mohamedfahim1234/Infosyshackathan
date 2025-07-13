import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import axios from 'axios';

interface OfficerLoginProps {
  onBack: () => void;
  onLogin: (userData: any) => void;
}

const OfficerLogin: React.FC<OfficerLoginProps> = ({ onBack, onLogin }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:8000/officer/login`, formData);
      if (response.data.success) {
        setLoading(false);
        alert(t('login.loginSuccess'));
        onLogin({
          id: response.data.officer._id,
          name: response.data.officer.name,
          email: response.data.officer.email,
          mobile: response.data.officer.phone,
          role: 'officer',
          token: response.data.token,
        });
      } else {
        alert(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during officer login:', error);
      alert(t('login.errorLogin'));
      setLoading(false);
    }
    
    // Simulate API call
    // setTimeout(() => {
    //   setLoading(false);
    //   onLogin({
    //     id: '1',
    //     name: 'Officer Name',
    //     email: formData.email,
    //     mobile: '9876543210',
    //     role: 'officer',
    //     officerId: formData.officerId
    //   });
    // }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('login.backToOptions')}</span>
          </button>
          
          <div className="mx-auto h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('login.officerLogin')}</h2>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Officer ID
              </label>
              <input
                type="text"
                value={formData.officerId}
                onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                placeholder={t('login.officerIdPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div> */}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('login.emailPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('login.passwordPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('login.loginButton')}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default OfficerLogin;