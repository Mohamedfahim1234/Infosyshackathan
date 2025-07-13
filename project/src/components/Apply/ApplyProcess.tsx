import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Upload, Eye, QrCode, ArrowLeft, Calendar, User, MapPin } from 'lucide-react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2563EB',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  field: {
    marginBottom: 8,
    fontSize: 12,
  },
  label: {
    color: '#6B7280',
  },
  value: {
    color: '#111827',
  },
  applicationId: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    color: '#2563EB',
  },
});

// Receipt PDF Component
const ReceiptPDF = ({ formData, applicationId }: { formData: any; applicationId: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Application Receipt</Text>
      
      <View style={styles.section}>
        <Text style={styles.title}>Certificate Details</Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Certificate Type: </Text>
          <Text style={styles.value}>{formData.certificateType.toUpperCase()}</Text>
        </Text>
        
        {formData.certificateType === 'birth' && (
          <>
            <Text style={styles.field}>
              <Text style={styles.label}>Request Type: </Text>
              <Text style={styles.value}>
                {formData.birthCertificateType === 'new' ? 'New Registration' : 'Certificate Update'}
              </Text>
            </Text>
            
            {formData.birthCertificateType === 'new' ? (
              <>
                <Text style={styles.field}>
                  <Text style={styles.label}>Child's Name: </Text>
                  <Text style={styles.value}>{formData.birthRegistration.childName}</Text>
                </Text>
                <Text style={styles.field}>
                  <Text style={styles.label}>Date of Birth: </Text>
                  <Text style={styles.value}>{formData.birthRegistration.dateOfBirth}</Text>
                </Text>
                <Text style={styles.field}>
                  <Text style={styles.label}>Father's Name: </Text>
                  <Text style={styles.value}>{formData.birthRegistration.fatherName}</Text>
                </Text>
                <Text style={styles.field}>
                  <Text style={styles.label}>Mother's Name: </Text>
                  <Text style={styles.value}>{formData.birthRegistration.motherName}</Text>
                </Text>
                <Text style={styles.field}>
                  <Text style={styles.label}>Address: </Text>
                  <Text style={styles.value}>{formData.birthRegistration.fullAddress}</Text>
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.field}>
                  <Text style={styles.label}>Update Type: </Text>
                  <Text style={styles.value}>{formData.updateIssueType}</Text>
                </Text>
              </>
            )}
          </>
        )}
      </View>
      
      <Text style={styles.applicationId}>Application ID: {applicationId}</Text>
      
      <View style={styles.section}>
        <Text style={styles.field}>
          <Text style={styles.label}>Submission Date: </Text>
          <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
        </Text>
        <Text style={styles.field}>
          <Text style={styles.label}>Estimated Processing Time: </Text>
          <Text style={styles.value}>
            {formData.certificateType === 'birth' ? '3-5 business days' : '7-10 business days'}
          </Text>
        </Text>
      </View>
    </Page>
  </Document>
);

const API_BASE_URL = 'http://localhost:8000'; // Adjust based on your backend URL

const ApplyProcess: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    certificateType: '',
    birthCertificateType: '', // 'new' or 'update'
    updateIssueType: '', // For certificate updation
    personalInfo: {
      fullName: '',
      email: '',
      mobile: '',
      address: ''
    },
    birthRegistration: {
      childName: '', // matches key from image
      dateOfBirth: '', // will be mapped to DOB
      fatherName: '', // matches key from image
      motherName: '', // matches key from image
      parentIdProof: null as File | null, // matches key from image
      medicalRecord: null as File | null, // will be mapped to medicalCertificate
      fullAddress: '', // will be mapped to address
      parentNativity: '' // matches key from image
    },
    birthUpdate: {
      currentName: '',
      correctName: '',
      currentDob: '',
      correctDob: '',
      currentGender: '',
      correctGender: '',
      proofDocuments: [] as File[]
    }
  });
  const [applicationId, setApplicationId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const steps = [
    { id: 1, title: t('apply.chooseType'), icon: FileText },
    { id: 2, title: t('apply.personalInfo'), icon: FileText },
    { id: 3, title: t('apply.documents'), icon: Upload },
    { id: 4, title: t('apply.review'), icon: Eye }
  ];

  const certificateTypes = [
    { id: 'birth', name: t('apply.birth'), icon: '👶', priority: 1 },
    { id: 'income', name: t('apply.income'), icon: '💰', priority: 2 },
    { id: 'caste', name: t('apply.caste'), icon: '📜', priority: 3 },
    { id: 'residence', name: t('apply.residence'), icon: '🏠', priority: 4 }
  ].sort((a, b) => a.priority - b.priority);

  const birthCertificateOptions = [
    { id: 'new', name: 'New Registration', description: 'Register a new birth certificate', icon: '📝' },
    { id: 'update', name: 'Certificate Updation', description: 'Update existing birth certificate information', icon: '✏️' }
  ];

  const updateIssueTypes = [
    { id: 'name', name: 'Incorrect Name', description: 'Correct the name on the certificate' },
    { id: 'dob', name: 'Incorrect Date of Birth', description: 'Correct the date of birth' },
    { id: 'gender', name: 'Incorrect Gender', description: 'Correct the gender information' }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const id = 'APP' + Math.random().toString(36).substr(2, 9).toUpperCase();

    try {
      const uploadData = new FormData();

      if (formData.certificateType === 'birth' && formData.birthCertificateType === 'new') {
        // Match the exact keys from the image
        uploadData.append('childName', formData.birthRegistration.childName);
        uploadData.append('DOB', formData.birthRegistration.dateOfBirth);
        uploadData.append('fatherName', formData.birthRegistration.fatherName);
        uploadData.append('motherName', formData.birthRegistration.motherName);
        uploadData.append('address', formData.birthRegistration.fullAddress);
        uploadData.append('parentNativity', formData.birthRegistration.parentNativity);
        
        // File uploads with exact keys
        if (formData.birthRegistration.parentIdProof) {
          uploadData.append('parentIdProof', formData.birthRegistration.parentIdProof);
        }
        if (formData.birthRegistration.medicalRecord) {
          uploadData.append('medicalCertificate', formData.birthRegistration.medicalRecord);
        }

        // Make API call for new birth registration
        await axios.post(`${API_BASE_URL}/user/upload`, uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setApplicationId(id);
        setCurrentStep(5);
      } else if (formData.certificateType === 'birth' && formData.birthCertificateType === 'update') {
        // Birth certificate update logic
        // ...existing update logic...
      } else {
        // Other certificate types logic
        // ...existing other certificates logic...
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (field: string, file: File | null, isArray = false) => {
    if (field.startsWith('birth.')) {
      const birthField = field.split('.')[1];
      setFormData({
        ...formData,
        birthRegistration: {
          ...formData.birthRegistration,
          [birthField]: file
        }
      });
    } else if (field.startsWith('update.')) {
      const updateField = field.split('.')[1];
      if (isArray && file) {
        setFormData({
          ...formData,
          birthUpdate: {
            ...formData.birthUpdate,
            [updateField]: [...formData.birthUpdate.proofDocuments, file]
          }
        });
      }
    }
  };

  const renderBirthCertificateForm = () => {
    if (formData.birthCertificateType === 'new') {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">New Birth Registration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child's Name *</label>
              <input
                type="text"
                value={formData.birthRegistration.childName}
                onChange={(e) => setFormData({
                  ...formData,
                  birthRegistration: { ...formData.birthRegistration, childName: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter child's full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
              <input
                type="date"
                value={formData.birthRegistration.dateOfBirth}
                onChange={(e) => setFormData({
                  ...formData,
                  birthRegistration: { ...formData.birthRegistration, dateOfBirth: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
              <input
                type="text"
                value={formData.birthRegistration.fatherName}
                onChange={(e) => setFormData({
                  ...formData,
                  birthRegistration: { ...formData.birthRegistration, fatherName: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter father's full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name *</label>
              <input
                type="text"
                value={formData.birthRegistration.motherName}
                onChange={(e) => setFormData({
                  ...formData,
                  birthRegistration: { ...formData.birthRegistration, motherName: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter mother's full name"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
            <textarea
              value={formData.birthRegistration.fullAddress}
              onChange={(e) => setFormData({
                ...formData,
                birthRegistration: { ...formData.birthRegistration, fullAddress: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter complete address"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parent's Nativity *</label>
            <input
              type="text"
              value={formData.birthRegistration.parentNativity}
              onChange={(e) => setFormData({
                ...formData,
                birthRegistration: { ...formData.birthRegistration, parentNativity: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter parent's place of origin"
              required
            />
          </div>
        </div>
      );
    } else if (formData.birthCertificateType === 'update') {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Certificate Updation</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Select Issue Type *</label>
            <div className="space-y-3">
              {updateIssueTypes.map((issue) => (
                <motion.button
                  key={issue.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setFormData({ ...formData, updateIssueType: issue.id })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    formData.updateIssueType === issue.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{issue.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
          
          {formData.updateIssueType && (
            <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
              {formData.updateIssueType === 'name' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Name</label>
                    <input
                      type="text"
                      value={formData.birthUpdate.currentName}
                      onChange={(e) => setFormData({
                        ...formData,
                        birthUpdate: { ...formData.birthUpdate, currentName: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Name as shown on certificate"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Name *</label>
                    <input
                      type="text"
                      value={formData.birthUpdate.correctName}
                      onChange={(e) => setFormData({
                        ...formData,
                        birthUpdate: { ...formData.birthUpdate, correctName: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Correct name to be updated"
                      required
                    />
                  </div>
                </div>
              )}
              
              {formData.updateIssueType === 'dob' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Date of Birth</label>
                    <input
                      type="date"
                      value={formData.birthUpdate.currentDob}
                      onChange={(e) => setFormData({
                        ...formData,
                        birthUpdate: { ...formData.birthUpdate, currentDob: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Date of Birth *</label>
                    <input
                      type="date"
                      value={formData.birthUpdate.correctDob}
                      onChange={(e) => setFormData({
                        ...formData,
                        birthUpdate: { ...formData.birthUpdate, correctDob: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}
              
              {formData.updateIssueType === 'gender' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Gender</label>
                    <select
                      value={formData.birthUpdate.currentGender}
                      onChange={(e) => setFormData({
                        ...formData,
                        birthUpdate: { ...formData.birthUpdate, currentGender: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select current gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Gender *</label>
                    <select
                      value={formData.birthUpdate.correctGender}
                      onChange={(e) => setFormData({
                        ...formData,
                        birthUpdate: { ...formData.birthUpdate, correctGender: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select correct gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('apply.chooseType')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificateTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, certificateType: type.id })}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    formData.certificateType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${type.id === 'birth' ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="text-3xl mb-3">{type.icon}</div>
                  <h4 className="font-medium text-gray-900">{type.name}</h4>
                  {type.id === 'birth' && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Priority Service
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
            
            {formData.certificateType === 'birth' && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Birth Certificate Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {birthCertificateOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, birthCertificateType: option.id })}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        formData.birthCertificateType === option.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{option.icon}</div>
                        <div>
                          <h5 className="font-medium text-gray-900">{option.name}</h5>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        if (formData.certificateType === 'birth' && formData.birthCertificateType) {
          return renderBirthCertificateForm();
        }
        
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('apply.personalInfo')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('apply.fullName')}</label>
                <input
                  type="text"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, fullName: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('apply.email')}</label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, email: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('apply.mobile')}</label>
                <input
                  type="tel"
                  value={formData.personalInfo.mobile}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, mobile: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('apply.address')}</label>
                <textarea
                  value={formData.personalInfo.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, address: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        if (formData.certificateType === 'birth') {
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Upload Required Documents</h3>
              
              {formData.birthCertificateType === 'new' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent's ID Proof *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('birth.parentIdProof', e.target.files?.[0] || null)}
                        className="hidden"
                        id="parent-id-proof"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label
                        htmlFor="parent-id-proof"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Parent's ID Proof</span>
                        <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                      </label>
                      {formData.birthRegistration.parentIdProof && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {formData.birthRegistration.parentIdProof.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Record *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload('birth.medicalRecord', e.target.files?.[0] || null)}
                        className="hidden"
                        id="medical-record"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label
                        htmlFor="medical-record"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Medical Record</span>
                        <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                      </label>
                      {formData.birthRegistration.medicalRecord && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {formData.birthRegistration.medicalRecord.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {formData.birthCertificateType === 'update' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setFormData({
                          ...formData,
                          birthUpdate: {
                            ...formData.birthUpdate,
                            proofDocuments: [...formData.birthUpdate.proofDocuments, ...files]
                          }
                        });
                      }}
                      className="hidden"
                      id="proof-documents"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="proof-documents"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">Upload supporting documents</p>
                      <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB each)</p>
                    </label>
                    {formData.birthUpdate.proofDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                        {formData.birthUpdate.proofDocuments.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded border">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        } else {
          // For non-birth certificates, skip to review
          setCurrentStep(4);
          return null;
        }

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('apply.review')}</h3>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Certificate Type</h4>
                <p className="text-gray-600">{certificateTypes.find(t => t.id === formData.certificateType)?.name}</p>
                {formData.certificateType === 'birth' && formData.birthCertificateType && (
                  <p className="text-sm text-blue-600">
                    {birthCertificateOptions.find(o => o.id === formData.birthCertificateType)?.name}
                  </p>
                )}
              </div>
              
              {formData.certificateType === 'birth' && formData.birthCertificateType === 'new' && (
                <div>
                  <h4 className="font-medium text-gray-900">Birth Registration Details</h4>
                  <div className="text-gray-600 space-y-1">
                    <p><strong>Child's Name:</strong> {formData.birthRegistration.childName}</p>
                    <p><strong>Date of Birth:</strong> {formData.birthRegistration.dateOfBirth}</p>
                    <p><strong>Father's Name:</strong> {formData.birthRegistration.fatherName}</p>
                    <p><strong>Mother's Name:</strong> {formData.birthRegistration.motherName}</p>
                    <p><strong>Address:</strong> {formData.birthRegistration.fullAddress}</p>
                    <p><strong>Parent's Nativity:</strong> {formData.birthRegistration.parentNativity}</p>
                  </div>
                </div>
              )}
              
              {formData.certificateType === 'birth' && formData.birthCertificateType === 'update' && (
                <div>
                  <h4 className="font-medium text-gray-900">Certificate Update Details</h4>
                  <div className="text-gray-600 space-y-1">
                    <p><strong>Issue Type:</strong> {updateIssueTypes.find(i => i.id === formData.updateIssueType)?.name}</p>
                    {formData.updateIssueType === 'name' && (
                      <>
                        <p><strong>Current Name:</strong> {formData.birthUpdate.currentName}</p>
                        <p><strong>Correct Name:</strong> {formData.birthUpdate.correctName}</p>
                      </>
                    )}
                    {formData.updateIssueType === 'dob' && (
                      <>
                        <p><strong>Current DOB:</strong> {formData.birthUpdate.currentDob}</p>
                        <p><strong>Correct DOB:</strong> {formData.birthUpdate.correctDob}</p>
                      </>
                    )}
                    {formData.updateIssueType === 'gender' && (
                      <>
                        <p><strong>Current Gender:</strong> {formData.birthUpdate.currentGender}</p>
                        <p><strong>Correct Gender:</strong> {formData.birthUpdate.correctGender}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {formData.certificateType !== 'birth' && (
                <div>
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                  <div className="text-gray-600">
                    <p>{formData.personalInfo.fullName}</p>
                    <p>{formData.personalInfo.email}</p>
                    <p>{formData.personalInfo.mobile}</p>
                    <p>{formData.personalInfo.address}</p>
                  </div>
                </div>
              )}
              
              {(formData.certificateType === 'birth') && (
                <div>
                  <h4 className="font-medium text-gray-900">Documents</h4>
                  <p className="text-gray-600">
                    {formData.birthCertificateType === 'new' 
                      ? `${(formData.birthRegistration.parentIdProof ? 1 : 0) + (formData.birthRegistration.medicalRecord ? 1 : 0)} required documents uploaded`
                      : formData.birthCertificateType === 'update'
                      ? `${formData.birthUpdate.proofDocuments.length} proof documents uploaded`
                      : 'No documents required'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="bg-green-100 p-8 rounded-lg">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">Application Submitted Successfully!</h3>
              <p className="text-green-700">Your application has been received and is being processed.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-4">{t('apply.applicationId')}</h4>
              <p className="text-2xl font-bold text-blue-600 mb-4">{applicationId}</p>
              
              <div className="flex justify-center mb-4">
                <QRCode value={applicationId} size={128} />
              </div>
              
              <p className="text-gray-600 mb-4">
                {t('apply.estimatedDelivery')}: {formData.certificateType === 'birth' ? '3-5' : '7-10'} {t('apply.days')}
              </p>
              
              <PDFDownloadLink
                document={<ReceiptPDF formData={formData} applicationId={applicationId} />}
                fileName={`application-receipt-${applicationId}.pdf`}
                className="inline-block"
              >
                {({ blob, url, loading, error }) => (
                  <button 
                    className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                      loading 
                        ? 'bg-gray-300 cursor-wait' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Preparing Download...' : t('apply.downloadReceipt')}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        if (formData.certificateType === 'birth') {
          return formData.birthCertificateType !== '';
        }
        return formData.certificateType !== '';
        
      case 2:
        if (formData.certificateType === 'birth' && formData.birthCertificateType === 'new') {
          return formData.birthRegistration.childName && 
                 formData.birthRegistration.dateOfBirth && 
                 formData.birthRegistration.fatherName && 
                 formData.birthRegistration.motherName &&
                 formData.birthRegistration.fullAddress &&
                 formData.birthRegistration.parentNativity;
        }
        if (formData.certificateType === 'birth' && formData.birthCertificateType === 'update') {
          return formData.updateIssueType && 
                 ((formData.updateIssueType === 'name' && formData.birthUpdate.correctName) ||
                  (formData.updateIssueType === 'dob' && formData.birthUpdate.correctDob) ||
                  (formData.updateIssueType === 'gender' && formData.birthUpdate.correctGender));
        }
        return formData.personalInfo.fullName && formData.personalInfo.email;

      case 3:
        if (formData.certificateType === 'birth') {
          if (formData.birthCertificateType === 'new') {
            return formData.birthRegistration.parentIdProof && formData.birthRegistration.medicalRecord;
          } else if (formData.birthCertificateType === 'update') {
            return formData.birthUpdate.proofDocuments.length > 0;
          }
        }
        return true;
        
      case 4:
        return true;
        
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('apply.title')}</h1>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-4 mt-8">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                  {step.id < steps.length && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {renderStep()}

          {currentStep < 5 && (
            <div className="mt-8">
              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{submitError}</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1 || isSubmitting}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('common.previous')}</span>
                </button>
                
                <button
                  onClick={() => {
                    if (currentStep === 4) {
                      handleSubmit();
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  disabled={!canProceed() || isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>
                    {currentStep === 4 
                      ? isSubmitting 
                        ? t('common.submitting') 
                        : t('apply.submit')
                      : t('common.next')
                    }
                  </span>
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyProcess;