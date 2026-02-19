import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportViewer() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (!report) return;

    const text = `Accessibility Audit Report. Overall compliance: ${report.overallCompliance.percentage} percent. Status: ${report.overallCompliance.verdict}. `;
    const details = Object.entries(report.compliance)
      .map(([param, data]) => `${param}: ${data.measured} millimeters. Status: ${data.status}.`)
      .join(' ');

    const utterance = new SpeechSynthesisUtterance(text + details);
    window.speechSynthesis.speak(utterance);
  };

  const downloadPDF = async () => {
    if (!report) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Accessibility Audit Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Title: ${report.title}`, 20, 30);
    doc.text(`Date: ${new Date(report.createdAt).toLocaleString()}`, 20, 40);
    doc.text(`Overall Compliance: ${report.overallCompliance.percentage}%`, 20, 50);
    doc.text(`Status: ${report.overallCompliance.verdict}`, 20, 60);

    let y = 80;
    doc.text('Compliance Details:', 20, y);
    y += 10;

    Object.entries(report.compliance).forEach(([param, data]) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `${param}: ${data.measured} mm | Required: ${data.min || 'N/A'} - ${data.max || 'N/A'} | Status: ${data.status}`,
        20,
        y
      );
      y += 10;
    });

    doc.save(`audit-report-${id}.pdf`);
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!report) {
    return <div className="text-center py-12">Report not found</div>;
  }

  return (
    <div className="px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{report.title}</h1>
          <div className="flex gap-2">
            <button
              onClick={playAudio}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Play Audio Summary
            </button>
            <button
              onClick={downloadPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Download PDF
            </button>
            <button
              onClick={printReport}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Print
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Created: {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>

        {report.imageUrl && (
          <div className="mb-6">
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${report.imageUrl}`}
              alt="Audit image"
              className="max-w-full rounded"
            />
          </div>
        )}

        <div className="mb-6 bg-blue-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Overall Compliance</h2>
          <p className="text-2xl font-bold text-blue-600">
            {report.overallCompliance.percentage}%
          </p>
          <p className="text-lg font-semibold">
            Status: {report.overallCompliance.verdict}
          </p>
          <p className="text-sm text-gray-600">
            {report.overallCompliance.compliant} out of {report.overallCompliance.total} parameters compliant
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Measured (mm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(report.compliance).map(([param, data]) => (
                <tr key={param}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {param.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.measured} mm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.min && `Min: ${data.min} mm`}
                    {data.min && data.max && ', '}
                    {data.max && `Max: ${data.max} mm`}
                    {!data.min && !data.max && 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        data.status === 'compliant'
                          ? 'bg-green-100 text-green-800'
                          : data.status === 'non-compliant'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {data.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {report.detections && report.detections.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Detections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.detections.map((det, idx) => (
                <div key={idx} className="border p-4 rounded">
                  <p className="font-semibold">{det.class}</p>
                  <p className="text-sm text-gray-600">Confidence: {det.confidence}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
