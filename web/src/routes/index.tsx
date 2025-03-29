import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: DashboardComponent,
});

function DashboardComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Dream Analysis Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-purple-100">
          <h3 className="text-xl font-semibold mb-4 text-purple-800">Recent Dreams</h3>
          <p className="text-gray-600 mb-4">You haven't analyzed any dreams yet.</p>
          <Link
            to="/dreams"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Analyze Your First Dream
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">Dream Patterns</h3>
          <p className="text-gray-600">Analyze multiple dreams to discover patterns in your subconscious.</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">No patterns detected yet. Analyze more dreams to see insights.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border border-amber-100">
          <h3 className="text-xl font-semibold mb-4 text-amber-800">Dream Journal</h3>
          <p className="text-gray-600 mb-4">Keep track of your dreams and their interpretations over time.</p>
          <Link
            to="/upload"
            className="inline-block bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
          >
            Upload Dream Journal
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border border-green-100">
          <h3 className="text-xl font-semibold mb-4 text-green-800">Dream Insights</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Did you know?</h4>
              <p className="text-sm text-gray-600">Most people dream 3-6 times per night, but forget 95% of their dreams.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Dream Tip</h4>
              <p className="text-sm text-gray-600">Keep a dream journal by your bed to record dreams immediately upon waking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardComponent;