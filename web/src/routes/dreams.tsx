import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import DreamAnalysisApp from '../components/DreamAnalysisApp';

export const Route = createFileRoute('/dreams')({
  component: DreamAnalysisComponent,
});

function DreamAnalysisComponent() {
  return (
    <div className="w-full h-full">
      <DreamAnalysisApp />
    </div>
  );
}

export default DreamAnalysisComponent; 