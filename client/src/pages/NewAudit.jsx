import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function NewAudit() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [referenceBbox, setReferenceBbox] = useState(null);
  const [referenceDimension, setReferenceDimension] = useState(210);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedDetections, setSelectedDetections] = useState([]);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Camera access denied');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        setImage(file);
        setPreview(canvas.toDataURL());
        video.srcObject.getTracks().forEach((track) => track.stop());
      });
    }
  };

  const handleReferenceSelect = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Simple reference selection - in production, use proper bbox selection
    setReferenceBbox({ x1: x - 50, y1: y - 50, x2: x + 50, y2: y + 50 });
  };

  const handleSubmit = async () => {
    if (!image) {
      alert('Please select or capture an image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', `Audit ${new Date().toLocaleString()}`);
      if (referenceBbox) {
        formData.append('referenceBbox', JSON.stringify(referenceBbox));
      }
      formData.append('referenceDimensionMm', referenceDimension.toString());

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/audit', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data);
      navigate(`/reports/${response.data.reportId}`);
    } catch (error) {
      console.error('Audit error:', error);
      alert('Audit failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const drawDetections = () => {
    if (!canvasRef.current || !results) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      results.detections.forEach((det) => {
        const { bbox } = det;
        ctx.strokeStyle = det.confidence > 0.5 ? 'green' : 'orange';
        ctx.lineWidth = 2;
        ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillText(
          `${det.class} (${det.confidence})`,
          bbox.x1,
          bbox.y1 - 5
        );
      });
    };
    img.src = preview;
  };

  if (results) {
    drawDetections();
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">New Audit</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Image Capture</h2>

          <div className="mb-4">
            <button
              onClick={startCamera}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Use Camera
            </button>
            <button
              onClick={captureImage}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Capture
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md rounded"
              style={{ display: image ? 'none' : 'block' }}
            />
            {preview && (
              <canvas
                ref={canvasRef}
                className="w-full max-w-md rounded border"
                onClick={handleReferenceSelect}
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Dimension (mm)
            </label>
            <input
              type="number"
              value={referenceDimension}
              onChange={(e) => setReferenceDimension(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="210 (A4 width)"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !image}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Run Audit'}
          </button>
        </div>

        {results && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="mb-4">
              <p className="text-lg">
                Compliance: <span className="font-bold">{results.overallCompliance.percentage}%</span>
              </p>
              <p className="text-lg">
                Status: <span className="font-bold">{results.overallCompliance.verdict}</span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Measured</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(results.compliance).map(([param, data]) => (
                    <tr key={param}>
                      <td className="px-4 py-2 text-sm">{param}</td>
                      <td className="px-4 py-2 text-sm">{data.measured} mm</td>
                      <td className="px-4 py-2 text-sm">
                        {data.min && `Min: ${data.min}`}
                        {data.min && data.max && ', '}
                        {data.max && `Max: ${data.max}`}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded ${
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
          </div>
        )}
      </div>
    </div>
  );
}
