import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Application } from '../../types';
import PendingApplications from './PendingApplications';
import ReviewApplication from './ReviewApplication';

const OfficerDashboard: React.FC = () => {
  const { t } = useTranslation();

  const [applications, setApplications] = useState<Application[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'pending' | 'review'>('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.post('http://localhost:8000/officer/certificates',{}); // Replace with actual endpoint
        const birthCertificates = response.data.birthCertificates;

        const formattedData = birthCertificates.map((item: any) => ({
          id: item._id,
          applicant: item.childName,
          type: 'Birth Certificate',
          district: item.address || 'N/A',
          submittedAt: new Date(item.createdAt).toISOString().split('T')[0],
          status: item.Isapproved
            ? 'approved'
            : item.Isrejected
            ? 'rejected'
            : 'pending'
        }));

        setApplications(formattedData);
      } catch (error) {
        console.error('Error fetching birth certificates:', error);
      }
    };

    fetchCertificates();
  }, []);

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'submitted' || app.status === 'under_review' || app.status === 'info_requested').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  const chartData = [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
  ];

  const monthlyData = [
    { month: 'Jan', applications: 65 },
    { month: 'Feb', applications: 78 },
    { month: 'Mar', applications: 89 },
    { month: 'Apr', applications: 92 },
    { month: 'May', applications: 105 },
    { month: 'Jun', applications: 118 }
  ];

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setCurrentView('review');
  };

  const handleStatusUpdate = (applicationId: string, status: string, reason?: string) => {
    console.log(`Application ${applicationId} updated to ${status}`, reason);
    setCurrentView('pending');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedApplication(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentView !== 'dashboard' && (
              <button
                onClick={handleBackToDashboard}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
              <p className="text-gray-600 mt-2">Manage and track certificate applications</p>
            </div>
          </div>

          {currentView === 'dashboard' && (
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('pending')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Clock className="w-5 h-5" />
                <span>View Pending Applications</span>
              </motion.button>
            </div>
          )}
        </div>

        {currentView === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.totalApplications')}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <FileText className="w-12 h-12 text-blue-600" />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.pending')}</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-600" />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.approved')}</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.rejected')}</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Applications</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {currentView === 'pending' && (
          <PendingApplications
            onViewApplication={handleViewApplication}
          />
        )}

        {currentView === 'review' && selectedApplication && (
          <ReviewApplication
            application={selectedApplication}
            onBack={() => setCurrentView('pending')}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
