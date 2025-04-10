import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/FileUpload.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [facilityType, setFacilityType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback(acceptedFiles => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!facilityType) {
      toast.error('Please select a facility type');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('facilityType', facilityType);
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('File uploaded successfully!');
      navigate(`/preview/${response.data.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="facilityType">Facility Type:</label>
          <select
            id="facilityType"
            value={facilityType}
            onChange={(e) => setFacilityType(e.target.value)}
            required
          >
            <option value="">Select Facility Type</option>
            <option value="hospital">Hospital</option>
            <option value="astc">Ambulatory Surgical Treatment Center (ASTC)</option>
            <option value="esrd">End-Stage Renal Disease Facility (ESRD)</option>
            <option value="ltc">Long-Term Care Facility (LTC)</option>
          </select>
        </div>
        
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="file-info">
              <p>Selected file: {file.name}</p>
              <p>({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
            </div>
          ) : isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <p>Drag and drop a CSV or Excel file here, or click to select</p>
          )}
        </div>
        
        {file && (
          <button type="submit" disabled={loading} className="upload-btn">
            {loading ? 'Processing...' : 'Generate PDF Profiles'}
          </button>
        )}
      </form>
    </div>
  );
};

export default FileUpload;