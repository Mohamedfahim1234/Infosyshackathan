import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FileText,
  Calendar,
  User,
  Eye,
  Clock,
  Search
} from 'lucide-react';
import { Application } from '../../types';

interface PendingApplicationsProps {
  onViewApplication: (application: Application) => void;
}

const PendingApplications: React.FC<PendingApplicationsProps> = ({ onViewApplication }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState({ type: 'all', priority: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingApplications, setPendingApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        const response = await axios.post('http://localhost:8000/officer/certificates',{}); // Replace with your actual API
        const birthCertificates = response.data.birthCertificates || [];

        const formatted = birthCertificates
          .filter((app: any) => app.Isapproved === false && app.Isrejected === false)
          .map((item: any) => ({
            id: item._id,
            userId: 'N/A',
            type: 'birth',
            personalInfo: {
              fullName: item.childName,
              email: '',
              mobile: '',
              address: item.address
            },
            birthRegistration: {
              childName: item.childName,
              dateOfBirth: item.DOB,
              fatherName: item.fatherName,
              motherName: item.motherName,
              parentIdProof: item.parentIdProof,
              medicalRecord: item.medicalCertificate,
              fullAddress: item.address,
              parentNativity: item.parentNativity
            },
            documents: [],
            status: 'submitted',
            submittedAt: new Date(item.createdAt),
            estimatedDelivery: new Date(new Date(item.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000),
            qrCode: item._id
          }));

        setPendingApplications(formatted);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchPendingApplications();
  }, []);

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case 'birth': return 'Birth Certificate';
      case 'income': return 'Income Certificate';
      case 'caste': return 'Caste Certificate';
      case 'residence': return 'Residence Certificate';
      default: return type;
    }
  };

  const getCertificateIcon = (type: string) => {
    switch (type) {
      case 'birth': return '👶';
      case 'income': return '💰';
      case 'caste': return '📜';
      case 'residence': return '🏠';
      default: return '📄';
    }
  };

  const getPriorityLevel = (type: string, submittedAt: Date) => {
    const daysSince = Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (type === 'birth') return 'high';
    if (daysSince > 5) return 'urgent';
    if (daysSince > 3) return 'medium';
    return 'normal';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const filteredApplications = pendingApplications.filter(app => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.personalInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filter.type === 'all' || app.type === filter.type;
    const priority = getPriorityLevel(app.type, app.submittedAt);
    const matchesPriority = filter.priority === 'all' || priority === filter.priority;

    return matchesSearch && matchesType && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Pending Applications</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="birth">Birth Certificate</option>
            <option value="income">Income Certificate</option>
            <option value="caste">Caste Certificate</option>
            <option value="residence">Residence Certificate</option>
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredApplications.map((application, index) => {
          const priority = getPriorityLevel(application.type, application.submittedAt);
          const daysSince = Math.floor((Date.now() - application.submittedAt.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{getCertificateIcon(application.type)}</div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{application.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
                        {priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">{getCertificateTypeLabel(application.type)}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{application.personalInfo.fullName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{application.submittedAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{daysSince} days ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewApplication(application)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>View</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Applications</h3>
          <p className="text-gray-500">All applications have been processed or no applications match your filters.</p>
        </div>
      )}
    </div>
  );
};

export default PendingApplications;
