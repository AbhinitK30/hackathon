import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (!confirm('Delete this report?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Report History</h1>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No reports yet</p>
          <Link
            to="/audit/new"
            className="text-blue-600 hover:text-blue-500 underline"
          >
            Create your first audit
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(report.createdAt).toLocaleString()}
              </p>
              {report.overallCompliance && (
                <div className="mb-4">
                  <p className="text-sm">
                    Compliance: <span className="font-bold">{report.overallCompliance.percentage}%</span>
                  </p>
                  <p className="text-sm">
                    Status: <span className="font-bold">{report.overallCompliance.verdict}</span>
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Link
                  to={`/reports/${report._id}`}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700"
                >
                  View
                </Link>
                <button
                  onClick={() => deleteReport(report._id)}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
