import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/upload')({
  component: DreamJournalUploadComponent,
});

interface FileUploadState {
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  message?: string;
}

function DreamJournalUploadComponent() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (file: File) => {
    // Update file status to uploading
    setFiles((prevFiles) =>
      prevFiles.map((f) =>
        f.file === file ? { ...f, status: "uploading" } : f
      )
    );

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update file status to completed
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file ? { ...f, status: "completed", message: "Dream journal uploaded successfully" } : f
        )
      );

      // Store data for dashboard
      const dashboardData = JSON.parse(localStorage.getItem('dreamJournals') || '[]');
      dashboardData.push({
        title: file.name,
        description: `Uploaded on ${new Date().toLocaleDateString()}`
      });
      localStorage.setItem('dreamJournals', JSON.stringify(dashboardData));

    } catch (error) {
      console.error("Error uploading file:", error);
      // Update file status to error
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file ? { ...f, status: "error", message: "Failed to upload dream journal" } : f
        )
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        status: "pending" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Automatically start uploading each file
      for (const { file } of newFiles) {
        uploadFile(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        file,
        status: "pending" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Automatically start uploading each file
      for (const { file } of newFiles) {
        uploadFile(file);
      }
      e.dataTransfer.clearData();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleGoToDashboard = () => {
    navigate({ to: '/' });
  };

  const handleConnectJournalApp = () => {
    console.log('Connect with Journal App button clicked');
    // Mock data creation for journal connection
    const mockData = [
      { title: 'Dream Journal Integration', description: `Connected on ${new Date().toLocaleDateString()}` }
    ];
    localStorage.setItem('dreamJournals', JSON.stringify(mockData));
    navigate({ to: '/' });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Dream Journal Upload</h3>
      
      {/* Upload area */}
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
            isDragging
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className={`w-8 h-8 mb-4 ${isDragging ? "text-purple-500" : "text-gray-500"}`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className={`mb-2 text-sm ${isDragging ? "text-purple-500" : "text-gray-500"}`}>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className={`text-xs ${isDragging ? "text-purple-500" : "text-gray-500"}`}>
              Text, PDF, or journal files
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Uploaded Dream Journals</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {files.map((fileState, i) => (
              <div key={`file-${i}-${fileState.file.name}`} className="bg-gray-50 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate max-w-[180px]" title={fileState.file.name}>
                    {fileState.file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      title="Remove file"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {(fileState.file.size / 1024).toFixed(2)} KB
                </div>
                <div className={`text-sm ${
                  fileState.status === "completed"
                    ? "text-green-500"
                    : fileState.status === "error"
                      ? "text-red-500"
                      : "text-purple-500"
                }`}>
                  {fileState.status === "completed"
                    ? "Uploaded successfully"
                    : fileState.status === "error"
                      ? "Failed to upload"
                      : fileState.status === "uploading"
                        ? "Uploading..."
                        : "Pending"}
                </div>
                {fileState.message && (
                  <div className="text-xs mt-1 text-gray-600">{fileState.message}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard button */}
      {files.some(f => f.status === "completed") && (
        <button
          type="button"
          onClick={handleGoToDashboard}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition mb-6"
        >
          Go to Dashboard
        </button>
      )}

      {/* Alternative upload methods */}
      <hr className="my-6 border-t border-gray-300" />
      
      <p className="text-sm mb-4 text-gray-600">Connect with your dream journal app</p>
      <button
        type="button"
        onClick={handleConnectJournalApp}
        className="flex items-center border border-purple-500 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Connect with Dream Journal App
      </button>
    </div>
  );
}

export default DreamJournalUploadComponent;
