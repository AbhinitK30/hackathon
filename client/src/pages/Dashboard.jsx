import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Harmonized Accessibility Architectural Audit System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Real-time compliance auditing for architectural spaces
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            to="/audit/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition"
          >
            Start New Audit
          </Link>
          <Link
            to="/reports"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition"
          >
            View Reports
          </Link>
        </div>
        <div className="mt-12 text-left max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Real-time object detection using YOLOv8</li>
            <li>Pixel-to-real-world measurement conversion</li>
            <li>Rule-based compliance checking</li>
            <li>Audio feedback and PDF reports</li>
            <li>Mobile-responsive interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
