'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getAssessmentHistory, deleteAssessment } from '@/lib/assessmentService';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Building, AlertTriangle, Trash2, Eye } from 'lucide-react';

export default function AssessmentHistory() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });

  useEffect(() => {
    if (isLoaded && user) {
      loadAssessments();
    }
  }, [isLoaded, user]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await getAssessmentHistory(pagination.limit, pagination.offset);
      setAssessments(data.assessments);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assessmentId) => {
    if (!confirm('Are you sure you want to delete this assessment?')) {
      return;
    }

    try {
      await deleteAssessment(assessmentId);
      // Reload assessments
      await loadAssessments();
    } catch (err) {
      alert('Failed to delete assessment: ' + err.message);
    }
  };

  const handleView = (assessmentId) => {
    router.push(`/result/${assessmentId}`);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your assessments...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Please sign in to view your assessments</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Assessment History
          </h1>
          <p className="text-gray-300 text-lg">
            View and manage your earthquake safety assessments
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && assessments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No assessments yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start your first earthquake safety assessment
            </p>
            <button
              onClick={() => router.push('/assessment/1')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Start New Assessment
            </button>
          </motion.div>
        )}

        {/* Assessment Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment, index) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              index={index}
              onView={() => handleView(assessment.id)}
              onDelete={() => handleDelete(assessment.id)}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="mt-12 flex justify-center gap-4">
            <button
              onClick={() => {
                if (pagination.offset > 0) {
                  setPagination(prev => ({ ...prev, offset: prev.offset - prev.limit }));
                  loadAssessments();
                }
              }}
              disabled={pagination.offset === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (pagination.hasMore) {
                  setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
                  loadAssessments();
                }
              }}
              disabled={!pagination.hasMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AssessmentCard({ assessment, index, onView, onDelete }) {
  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-500/10';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'very high': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getRatingColor = (rating) => {
    const colors = {
      'A': 'bg-green-500',
      'B': 'bg-blue-500',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'E': 'bg-red-500',
    };
    return colors[rating] || 'bg-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {assessment.buildingInfo?.buildingName || 'Building Assessment'}
          </h3>
          <p className="text-sm text-gray-400">
            {new Date(assessment.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        {assessment.safetyResult?.safetyRating && (
          <div className={`w-10 h-10 rounded-full ${getRatingColor(assessment.safetyResult.safetyRating)} flex items-center justify-center text-white font-bold text-lg`}>
            {assessment.safetyResult.safetyRating}
          </div>
        )}
      </div>

      {/* Location */}
      {assessment.location && (
        <div className="flex items-center gap-2 text-gray-300 mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">
            {assessment.location.city || assessment.location.fullAddress || 'Unknown location'}
          </span>
        </div>
      )}

      {/* Building Type */}
      {assessment.buildingInfo && (
        <div className="flex items-center gap-2 text-gray-300 mb-4">
          <Building className="h-4 w-4" />
          <span className="text-sm">
            {assessment.buildingInfo.numberOfFloors} floors • {assessment.buildingInfo.structuralSystem}
          </span>
        </div>
      )}

      {/* Risk Level */}
      {assessment.safetyResult?.riskLevel && (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 ${getRiskColor(assessment.safetyResult.riskLevel)}`}>
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{assessment.safetyResult.riskLevel} Risk</span>
        </div>
      )}

      {/* Score */}
      {assessment.safetyResult?.overallScore !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-400">Safety Score</span>
            <span className="text-sm font-semibold text-white">
              {Math.round(assessment.safetyResult.overallScore)}/100
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${assessment.safetyResult.overallScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
