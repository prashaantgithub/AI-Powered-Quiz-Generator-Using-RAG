import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFile } from '../services/api';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const allowedExtensions = ['.pdf', '.docx', '.pptx', '.txt'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    setSuccess(false);

    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(`.${ext}`)) {
        setError(`Invalid format. Allowed: ${allowedExtensions.join(', ')}`);
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const data = await uploadFile(file);
      setSuccess(true);
      onUploadSuccess(data.file_hash, file.name);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and process file.');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-xl mx-auto border-2 border-dashed border-slate-300 p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-blue-50 p-4 rounded-full">
          {loading ? (
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          ) : success ? (
            <CheckCircle className="w-12 h-12 text-green-500" />
          ) : (
            <Upload className="w-12 h-12 text-blue-600" />
          )}
        </div>

        <h2 className="text-xl font-bold">Upload Study Material</h2>
        <p className="text-slate-500 text-sm">
          Support for PDF, DOCX, PPTX, and TXT (Max 10MB)
        </p>

        {!success && (
          <div className="w-full">
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.docx,.pptx,.txt"
              disabled={loading}
            />
            <label
              htmlFor="fileInput"
              className={`flex items-center justify-center gap-2 cursor-pointer border rounded-lg p-3 transition-colors ${
                file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-5 h-5 text-slate-500" />
              <span className="truncate max-w-xs">
                {file ? file.name : 'Select a file...'}
              </span>
            </label>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg w-full">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm text-left">{error}</span>
          </div>
        )}

        {!success && (
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="btn-primary w-full flex justify-center items-center gap-2 mt-2"
          >
            {loading ? 'Processing Content...' : 'Proceed to Configuration'}
          </button>
        )}

        {success && (
          <div className="text-green-600 font-medium animate-pulse">
            Content indexed successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;