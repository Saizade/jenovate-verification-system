import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';

import {
  HiEye,
  HiExclamationTriangle, HiCheckCircle
} from 'react-icons/hi2';

export default function FraudReportsPage() {
  const [results, setResults] = useState([]);
  const [studentNames, setStudentNames] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Analytics summary cards
  const [summary, setSummary] = useState({
    total: 0,
    highRisk: 0,
    review: 0,
    safe: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        // Fetch sorted by fraud score desc so worst flags appear first
        sort: 'fraud_score',
        order: 'DESC'
      }).toString();

      const res = await api.get(`/verification?${queryParams}`);
      if (res.data.success) {
        setResults(res.data.data.results);
        setTotalPages(res.data.data.totalPages || 1);

        // Fetch students to map reference ID to name
        const studentsRes = await api.get('/students?limit=100');
        const students = studentsRes.data.data.students || [];
        const nameMap = new Map(students.map((s) => [s.reference_id, s.full_name]));
        setStudentNames(nameMap);

        // Calculate counts
        const allRes = await api.get('/verification?limit=1000');
        const all = allRes.data.data.results || [];
        let highRisk = 0;
        let review = 0;
        let safe = 0;

        all.forEach((r) => {
          if (r.fraud_level === 'HIGH_RISK') highRisk++;
          else if (r.fraud_level === 'REVIEW_REQUIRED') review++;
          else safe++;
        });

        setSummary({
          total: all.length,
          highRisk,
          review,
          safe
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fraud reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getRiskColor = (score) => {
    if (score >= 51) return 'text-red-650 bg-red-50 border-red-200';
    if (score >= 21) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getRiskMeter = (score) => {
    return (
      <div className="flex items-center gap-2 w-32">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              score >= 51 ? 'bg-red-550' : score >= 21 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <span className="text-xs font-bold text-gray-700 font-mono">{score}</span>
      </div>
    );
  };

  const getLevelBadge = (level) => {
    if (level === 'HIGH_RISK') return <Badge variant="danger">High Risk</Badge>;
    if (level === 'REVIEW_REQUIRED') return <Badge variant="warning">Review Required</Badge>;
    return <Badge variant="success">Safe</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight">
          Fraud Alerts & Risk Audit
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor risk profiles, review automated fraud scoring computations, and coordinate audits.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary-500 shadow-inner">
            <HiExclamationTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Total Audited</span>
            <span className="text-2xl font-black text-gray-800 leading-tight">{summary.total}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4 border-l-4 border-l-rose-500">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
            <HiExclamationTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block text-rose-600">High Risk Flags</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">{summary.highRisk}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
            <HiExclamationTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block text-amber-600">Review Required</span>
            <span className="text-2xl font-black text-amber-600 leading-tight">{summary.review}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
            <HiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block text-emerald-600">Clear / Safe</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">{summary.safe}</span>
          </div>
        </div>
      </div>

      {/* Fraud Alert Table */}
      <Card className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="table-row" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <Table
              headers={['Ref ID', 'Student Name', 'Fraud Score Gauge', 'Severity', 'Difference', 'Date Flagged', 'Action']}
              rows={results.map((res) => [
                <span className="font-mono text-xs font-bold text-gray-800" key={res.id}>{res.reference_id}</span>,
                <span className="font-semibold text-gray-800" key={res.id}>
                  {studentNames.get(res.reference_id) || 'Student Record'}
                </span>,
                <div key={res.id}>{getRiskMeter(res.fraud_score)}</div>,
                <div key={res.id}>{getLevelBadge(res.fraud_level)}</div>,
                <span className="font-bold text-rose-600" key={res.id}>{formatCurrency(res.difference_amount)}</span>,
                <span className="text-xs text-gray-400" key={res.id}>
                  {res.verified_at ? new Date(res.verified_at).toLocaleDateString() : '—'}
                </span>,
                <Button
                  key={res.id}
                  variant="ghost"
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-850 py-1 px-2.5 text-xs font-bold"
                  onClick={() => {
                    setSelectedResult(res);
                    setShowDetailModal(true);
                  }}
                >
                  <HiEye className="w-4 h-4" /> Audit Detail
                </Button>
              ])}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="py-1 px-3 text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="py-1 px-3 text-xs"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-50 border border-dashed border-gray-200 rounded-2xl">
            <HiCheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
            <p className="text-sm font-semibold text-gray-700">No Fraud Reports Logged</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              No transactions have generated mismatch flags. The database is clean.
            </p>
          </div>
        )}
      </Card>

      {/* Audit Detail Modal */}
      {showDetailModal && selectedResult && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Fraud Risk Investigation: ${selectedResult.reference_id}`}
          size="md"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg mb-3 ${getRiskColor(
                  selectedResult.fraud_score
                )}`}
              >
                {selectedResult.fraud_score}%
              </div>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">
                Risk Rating: {selectedResult.fraud_level?.replace('_', ' ')}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Ref ID: {selectedResult.reference_id}
              </p>
            </div>

            {/* Fraud Breakdown */}
            <div className="bg-gray-50 border border-gray-200/50 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-1.5 border-b border-gray-200/50">
                Risk Engine Checklist
              </h4>

              {selectedResult.field_details ? (
                Object.entries(
                  typeof selectedResult.field_details === 'string'
                    ? JSON.parse(selectedResult.field_details)
                    : selectedResult.field_details
                ).map(([field, details]) => {
                  const hasViolation = !details.match;
                  let penalty = 0;
                  if (hasViolation) {
                    if (field === 'payment_amount') penalty = 30;
                    else if (field === 'course_name') penalty = 25;
                    else if (field === 'student_name') penalty = 20;
                    else penalty = 10;
                  }

                  return (
                    <div key={field} className="flex items-center justify-between text-xs py-1">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700 capitalize">
                          {field.replace('_', ' ')} Mismatch
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {hasViolation ? `V: ${details.student_value} vs ${details.employee_value}` : 'No violation'}
                        </span>
                      </div>
                      <span className={`font-bold ${hasViolation ? 'text-red-650' : 'text-emerald-600'}`}>
                        {hasViolation ? `+${penalty}% Risk` : 'Passed (0)'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 italic">No details logged.</p>
              )}
            </div>

            {/* Actions for Admins */}
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex gap-3 text-xs">
              <HiExclamationTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Required Action</p>
                <p className="text-amber-700 mt-0.5">
                  Confirm transaction details with the student and coordindator. Review the uploaded receipt to determine the cause of the{' '}
                  <strong>{formatCurrency(selectedResult.difference_amount)}</strong> difference.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 gap-2">
              <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                Dismiss
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.success('Investigation file opened.');
                  setShowDetailModal(false);
                }}
              >
                Start Investigation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
