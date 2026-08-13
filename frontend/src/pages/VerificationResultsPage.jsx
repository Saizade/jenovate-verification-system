import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

import {
  HiChevronDown, HiChevronUp, HiArrowDownTray,
  HiCheckCircle, HiXCircle, HiExclamationCircle, HiFunnel
} from 'react-icons/hi2';

export default function VerificationResultsPage() {
  const [results, setResults] = useState([]);
  const [studentNames, setStudentNames] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [matchStatus, setMatchStatus] = useState('');
  const [fraudLevel, setFraudLevel] = useState('');
  
  // Expanded rows state
  const [expandedRow, setExpandedRow] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        matchStatus,
        fraudLevel
      }).toString();

      const res = await api.get(`/verification?${queryParams}`);
      if (res.data.success) {
        setResults(res.data.data.results);
        setTotalPages(res.data.data.totalPages || 1);

        // Fetch students to map reference ID to student name
        const studentsRes = await api.get('/students?limit=100');
        const students = studentsRes.data.data.students || [];
        const nameMap = new Map(students.map((s) => [s.reference_id, s.full_name]));
        setStudentNames(nameMap);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load verification results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page, matchStatus, fraudLevel]);

  const toggleRow = (refId) => {
    if (expandedRow === refId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(refId);
    }
  };

  const handleExport = async (format) => {
    try {
      toast.loading(`Generating ${format.toUpperCase()} export...`);
      const queryParams = new URLSearchParams({
        matchStatus,
        fraudLevel
      }).toString();

      const response = await api.get(`/export/verification/${format}?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `verification-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
      toast.dismiss();
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error('Export failed.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getMatchBadge = (status) => {
    if (status === 'MATCH') return <Badge variant="success">MATCH</Badge>;
    if (status === 'MISMATCH') return <Badge variant="danger">MISMATCH</Badge>;
    return <Badge variant="neutral">PENDING</Badge>;
  };

  const getFraudLevelBadge = (level) => {
    if (level === 'HIGH_RISK') return <Badge variant="danger">High Risk</Badge>;
    if (level === 'REVIEW_REQUIRED') return <Badge variant="warning">Review Required</Badge>;
    return <Badge variant="success">Safe</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight">
            Verification Results
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Analyze comparison outcomes, detect data mismatch values, and compute difference amounts.
          </p>
        </div>

        {/* Exports */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1.5 text-xs py-2"
            onClick={() => handleExport('excel')}
          >
            <HiArrowDownTray className="w-4 h-4" /> Export Excel
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-1.5 text-xs py-2"
            onClick={() => handleExport('pdf')}
          >
            <HiArrowDownTray className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Match Status */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Match Status
            </label>
            <select
              className="form-input"
              value={matchStatus}
              onChange={(e) => {
                setMatchStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="MATCH">MATCH</option>
              <option value="MISMATCH">MISMATCH</option>
            </select>
          </div>

          {/* Fraud Level */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Risk Severity
            </label>
            <select
              className="form-input"
              value={fraudLevel}
              onChange={(e) => {
                setFraudLevel(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Risks</option>
              <option value="SAFE">Safe (0-20)</option>
              <option value="REVIEW_REQUIRED">Review Required (21-50)</option>
              <option value="HIGH_RISK">High Risk (51-100)</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <Button
              type="button"
              variant="outline"
              className="w-full py-2 text-xs"
              onClick={() => {
                setMatchStatus('');
                setFraudLevel('');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Verification Table */}
      <Card className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="table-row" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Match Status</th>
                    <th className="py-3 px-4">Difference</th>
                    <th className="py-3 px-4">Fraud Score</th>
                    <th className="py-3 px-4">Fraud Level</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((result) => {
                    const isExpanded = expandedRow === result.reference_id;
                    const studentName = studentNames.get(result.reference_id) || 'Student Record';
                    const hasDifference = parseFloat(result.difference_amount) > 0;

                    return (
                      <React.Fragment key={result.id}>
                        <tr
                          className={`hover:bg-gray-50/50 transition duration-150 cursor-pointer ${
                            isExpanded ? 'bg-gray-50/70 border-l-4 border-primary-950' : ''
                          }`}
                          onClick={() => toggleRow(result.reference_id)}
                        >
                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-gray-800">
                            {result.reference_id}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gray-800">
                            {studentName}
                          </td>
                          <td className="py-3.5 px-4">
                            {getMatchBadge(result.match_status)}
                          </td>
                          <td className={`py-3.5 px-4 font-bold ${hasDifference ? 'text-red-650' : 'text-gray-500'}`}>
                            {formatCurrency(result.difference_amount)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-800">
                            {result.fraud_score} / 100
                          </td>
                          <td className="py-3.5 px-4">
                            {getFraudLevelBadge(result.fraud_level)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Button variant="ghost" className="p-1">
                              {isExpanded ? <HiChevronUp className="w-5 h-5 text-gray-500" /> : <HiChevronDown className="w-5 h-5 text-gray-500" />}
                            </Button>
                          </td>
                        </tr>

                        {/* Expandable Comparison Panel */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="py-4 px-6 bg-gray-50 border-t border-b border-gray-200/50">
                              <div className="space-y-4 max-w-4xl">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                                  🔍 Field-by-Field Audit Report
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {result.field_details ? (
                                    Object.entries(
                                      typeof result.field_details === 'string'
                                        ? JSON.parse(result.field_details)
                                        : result.field_details
                                    ).map(([field, details]) => {
                                      const isMatch = details.match;
                                      return (
                                        <div
                                          key={field}
                                          className={`flex flex-col p-3 rounded-xl border transition ${
                                            isMatch
                                              ? 'bg-white border-gray-100 shadow-sm'
                                              : 'bg-rose-50/30 border-rose-100 shadow-sm'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide capitalize">
                                              {field.replace('_', ' ')}
                                            </span>
                                            {isMatch ? (
                                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600">
                                                <HiCheckCircle className="w-3.5 h-3.5" /> Match
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 animate-pulse">
                                                <HiXCircle className="w-3.5 h-3.5" /> Mismatch
                                              </span>
                                            )}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="p-1.5 rounded bg-surface-50 border border-gray-100">
                                              <span className="text-[10px] text-gray-400 uppercase font-medium">Student Answer</span>
                                              <p className="font-semibold text-gray-800 mt-0.5">
                                                {String(details.student_value || '—')}
                                              </p>
                                            </div>
                                            <div className="p-1.5 rounded bg-surface-50 border border-gray-100">
                                              <span className="text-[10px] text-gray-400 uppercase font-medium">Employee Entry</span>
                                              <p className="font-semibold text-gray-850 mt-0.5">
                                                {String(details.employee_value || '—')}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">No breakdown details available.</p>
                                  )}
                                </div>

                                {result.remarks && (
                                  <div className="p-3 bg-white rounded-xl border border-gray-200/50 mt-2 text-xs">
                                    <span className="font-bold text-gray-400 block uppercase tracking-wider mb-1">
                                      Employee Remarks
                                    </span>
                                    <p className="text-gray-650 italic">"{result.remarks}"</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

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
            <HiExclamationCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-700">No Verification Results</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              No comparison audits logged. Confirm employee forms have been completed.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
