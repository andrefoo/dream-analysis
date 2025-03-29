import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useWebSocket } from '../hooks/useWebSocket';

interface ProcessingStep {
  name: string;
  displayName: string;
  inputField: string;
  outputField: string;
  explanationField: string;
}

interface EmailDetail {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  received_date: string;
  body_content: string;
  status: string;
  current_step: string;
  // All other email fields from the Email model
  [key: string]: any;
}

const processingSteps: ProcessingStep[] = [
  {
    name: 'email_extraction',
    displayName: 'Email Extraction',
    inputField: 'email_extraction_input',
    outputField: 'email_extraction_output',
    explanationField: 'email_extraction_explanation'
  },
  {
    name: 'industry_code',
    displayName: 'Industry Code Identification',
    inputField: 'industry_code_input',
    outputField: 'industry_code_output',
    explanationField: 'industry_code_explanation'
  },
  {
    name: 'base_rate',
    displayName: 'Base Rate Determination',
    inputField: 'base_rate_input',
    outputField: 'base_rate_output',
    explanationField: 'base_rate_explanation'
  },
  {
    name: 'revenue_estimation',
    displayName: 'Revenue Estimation',
    inputField: 'revenue_estimation_input',
    outputField: 'revenue_estimation_output',
    explanationField: 'revenue_estimation_explanation'
  },
  {
    name: 'base_premium',
    displayName: 'Base Premium Calculation',
    inputField: 'base_premium_input',
    outputField: 'base_premium_output',
    explanationField: 'base_premium_explanation'
  },
  {
    name: 'premium_modifiers',
    displayName: 'Premium Modifiers',
    inputField: 'premium_modifiers_input',
    outputField: 'premium_modifiers_output',
    explanationField: 'premium_modifiers_explanation'
  },
  {
    name: 'authority_check',
    displayName: 'Authority Check',
    inputField: 'authority_check_input',
    outputField: 'authority_check_output',
    explanationField: 'authority_check_explanation'
  },
  {
    name: 'coverage_details',
    displayName: 'Coverage Details',
    inputField: 'coverage_details_input',
    outputField: 'coverage_details_output',
    explanationField: 'coverage_details_explanation'
  },
  {
    name: 'risk_assessment',
    displayName: 'Risk Assessment',
    inputField: 'risk_assessment_input',
    outputField: 'risk_assessment_output',
    explanationField: 'risk_assessment_explanation'
  },
  {
    name: 'response_email',
    displayName: 'Response Email',
    inputField: 'response_email_input',
    outputField: 'response_email',
    explanationField: ''
  }
];

const EmailDetails: React.FC = () => {
  const { emailId } = useParams({ from: '/email/$emailId' });
  const navigate = useNavigate();
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [activeStep, setActiveStep] = useState<string>('email_extraction');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedOutput, setEditedOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  
  // Initialize WebSocket connection
  const handleMessage = useCallback((event: MessageEvent) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'email_detail') {
      setEmail(message.data);
      setIsProcessing(message.data.status === 'processing');
    } else if (message.type === 'processing_update') {
      setIsProcessing(message.processing);
      if (message.error) {
        setError(message.error);
      }
    }
  }, []);
  
  const { sendMessage, connectionStatus } = useWebSocket(
    `${import.meta.env.VITE_WS_URL || 'ws://localhost:5001'}/api/ws/email/${emailId}`,
    handleMessage
  );
  
  // Request email details when component mounts
  useEffect(() => {
    if (connectionStatus === 'Connected') {
      sendMessage(JSON.stringify({
        type: 'get_email_detail',
        email_id: emailId
      }));
    }
  }, [connectionStatus, emailId, sendMessage]);
  
  // Format JSON for display
  const formatJSON = (json: any): string => {
    if (!json) return '';
    if (typeof json === 'string') {
      try {
        return JSON.stringify(JSON.parse(json), null, 2);
      } catch {
        return json;
      }
    }
    return JSON.stringify(json, null, 2);
  };
  
  // Handle step change
  const handleStepChange = (stepName: string) => {
    setActiveStep(stepName);
    setEditMode(false);
    setError('');
  };
  
  // Get current step data
  const getCurrentStep = (): ProcessingStep | undefined => {
    return processingSteps.find(step => step.name === activeStep);
  };
  
  // Get step input data
  const getStepInput = (): string => {
    if (!email || !getCurrentStep()) return '';
    
    const step = getCurrentStep();
    if (!step) return '';
    
    // Special case for email extraction which uses body_content directly
    if (step.name === 'email_extraction') {
      return email.body_content || '';
    }
    
    const inputData = email[step.inputField];
    return formatJSON(inputData);
  };
  
  // Get step output data
  const getStepOutput = (): string => {
    if (!email || !getCurrentStep()) return '';
    
    const step = getCurrentStep();
    if (!step) return '';
    
    const outputData = email[step.outputField];
    return formatJSON(outputData);
  };
  
  // Get step explanation
  const getStepExplanation = (): string => {
    if (!email || !getCurrentStep()) return '';
    
    const step = getCurrentStep();
    if (!step || !step.explanationField) return '';
    
    return email[step.explanationField] || '';
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (!editMode) {
      setEditedOutput(getStepOutput());
    }
    setEditMode(!editMode);
  };
  
  // Save edited output
  const saveEditedOutput = () => {
    if (!email) return;
    
    const step = getCurrentStep();
    if (!step) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Parse the edited output to ensure it's valid JSON
      const parsedOutput = JSON.parse(editedOutput);
      
      sendMessage(JSON.stringify({
        type: 'update_step_output',
        email_id: emailId,
        step: step.name,
        output_field: step.outputField,
        output_value: parsedOutput
      }));
    } catch (e) {
      setError('Invalid JSON format');
      setIsProcessing(false);
    }
  };
  
  // Rerun processing from current step
  const rerunFromStep = () => {
    if (!email) return;
    
    const step = getCurrentStep();
    if (!step) return;
    
    setIsProcessing(true);
    setError('');
    
    sendMessage(JSON.stringify({
      type: 'rerun_from_step',
      email_id: emailId,
      step: step.name
    }));
  };
  
  // Handle back button
  const handleBack = () => {
    navigate({ to: '/' });
  };
  
  // Add this function to handle document viewing
  const handleViewDocument = (documentPath: string) => {
    setActiveDocument(documentPath);
  };
  
  const closeDocumentViewer = () => {
    setActiveDocument(null);
  };
  
  // Get documents for current step
  const getStepDocuments = (): {name: string, path: string}[] => {
    if (!getCurrentStep()) return [];
    
    const step = getCurrentStep()?.name;
    
    switch(step) {
      case 'email_extraction':
        return [
          { name: "Commercial Lines App Templates", path: "/api/documents/commercial-lines-app-templates.pdf" }
        ];
      case 'industry_code':
        return [
          { name: "Industry UW Guidelines", path: "/api/documents/industry-uw-guidelines.pdf" },
          { name: "Rating Factors", path: "/api/documents/rating-factors.pdf" }
        ];
      case 'base_rate':
        return [
          { name: "Rating Manual", path: "/api/documents/rating-manual.pdf" },
          { name: "Rating Factors", path: "/api/documents/rating-factors.pdf" }
        ];
      case 'revenue_estimation':
        return [
          { name: "Rating Factors", path: "/api/documents/rating-factors.pdf" },
          { name: "Industry UW Guidelines", path: "/api/documents/industry-uw-guidelines.pdf" }
        ];
      case 'premium_modifiers':
        return [
          { name: "Rating Factors", path: "/api/documents/rating-factors.pdf" }
        ];
      case 'authority_check':
        return [
          { name: "Authority Levels", path: "/api/documents/authority-levels.pdf" }
        ];
      case 'coverage_details':
        return [
          { name: "Coverage Limitations", path: "/api/documents/coverage-limitations.pdf" },
          { name: "Coverage Options", path: "/api/documents/coverage-options.pdf" },
          { name: "Policy Form Library", path: "/api/documents/policy-form-library.pdf" }
        ];
      case 'response_email':
        return [
          { name: "Policy Form Library", path: "/api/documents/policy-form-library.pdf" },
          { name: "Commercial Lines App Templates", path: "/api/documents/commercial-lines-app-templates.pdf" }
        ];
      default:
        return [];
    }
  };
  
  if (!email) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Dashboard
        </button>
        <div className="text-sm">
          Connection Status: 
          <span className={`ml-2 px-2 py-1 rounded-full ${
            connectionStatus === 'Connected' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus}
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">From: {email.sender}</p>
            <p className="text-sm text-gray-600">To: {email.recipient}</p>
            <p className="text-sm text-gray-600">Received: {new Date(email.received_date).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              email.status === 'completed' ? 'bg-green-100 text-green-800' :
              email.status === 'processing' ? 'bg-blue-100 text-blue-800' :
              email.status === 'failed' ? 'bg-red-100 text-red-800' :
              email.status === 'requires_human_review' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {email.status.replace('_', ' ')}
            </span>
            {email.current_step && (
              <p className="text-sm text-gray-600 mt-2">Current step: {email.current_step}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Steps sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Processing Steps</h2>
            <ul className="space-y-2">
              {processingSteps.map((step) => (
                <li key={step.name}>
                  <button
                    onClick={() => handleStepChange(step.name)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      activeStep === step.name
                        ? 'bg-indigo-100 text-indigo-800 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {step.displayName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Step details */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{getCurrentStep()?.displayName}</h2>
              <div className="flex space-x-2">
                {!isProcessing && (
                  <>
                    <button
                      onClick={toggleEditMode}
                      className={`px-4 py-2 rounded text-sm font-medium ${
                        editMode
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {editMode ? 'Cancel' : 'Edit Output'}
                    </button>
                    {editMode && (
                      <button
                        onClick={saveEditedOutput}
                        className="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                      >
                        Save
                      </button>
                    )}
                    <button
                      onClick={rerunFromStep}
                      className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                    >
                      Rerun from here
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {isProcessing && (
              <div className="flex items-center justify-center p-4 mb-4 bg-blue-50 rounded">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                <p className="text-blue-600">Processing...</p>
              </div>
            )}
            
            {error && (
              <div className="p-4 mb-4 bg-red-50 text-red-600 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              {/* Input section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Input</h3>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-60">
                  <pre className="text-sm whitespace-pre-wrap">{getStepInput()}</pre>
                </div>
              </div>
              
              {/* Output section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Output</h3>
                {editMode ? (
                  <textarea
                    value={editedOutput}
                    onChange={(e) => setEditedOutput(e.target.value)}
                    className="w-full h-60 p-4 text-sm font-mono border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-60">
                    <pre className="text-sm whitespace-pre-wrap">{getStepOutput()}</pre>
                  </div>
                )}
              </div>
              
              {/* Explanation section */}
              {getStepExplanation() && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Explanation</h3>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-60">
                    <p className="text-sm whitespace-pre-wrap">{getStepExplanation()}</p>
                  </div>
                </div>
              )}
              
              {/* Reference Documents section */}
              {getStepDocuments().length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Reference Documents</h3>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2">
                    {getStepDocuments().map((doc, index) => (
                      <div key={index}>
                        <button 
                          onClick={() => handleViewDocument(doc.path)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {doc.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Document Viewer */}
              {activeDocument && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Document Viewer</h3>
                  <div className="border border-gray-200 rounded h-96">
                    <iframe 
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${activeDocument}`}
                      className="w-full h-full border-0"
                      title="Document Viewer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetails;
