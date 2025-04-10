import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/PdfPreview.css';

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(0);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    const fetchPdfData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/pdf/${id}`);
        setPdfData(response.data.pdfUrl);
        setFacilities(response.data.facilities);
        setError(null);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError('Failed to load PDF preview');
        toast.error('Failed to load PDF preview');
      } finally {
        setLoading(false);
      }
    };

    fetchPdfData();
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleDownload = async () => {
    try {
      // Get just the current facility PDF
      if (facilities.length > 0) {
        const facilityId = facilities[selectedFacility].id;
        window.open(`/api/pdf/download/${id}/${facilityId}`, '_blank');
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error('Failed to download PDF');
    }
  };

  const handleDownloadAll = async () => {
    try {
      window.open(`/api/pdf/download-all/${id}`, '_blank');
    } catch (err) {
      console.error('Error downloading all PDFs:', err);
      toast.error('Failed to download all PDFs');
    }
  };

  const handleSelectFacility = (index) => {
    setSelectedFacility(index);
  };

  const handleReturn = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading PDF preview...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={handleReturn}>Return to Upload</button>
      </div>
    );
  }

  return (
    <div className="pdf-preview-page">
      <h2>PDF Preview</h2>
      
      {facilities.length > 0 && (
        <div className="facility-selector">
          <label htmlFor="facility-select">Select Facility:</label>
          <select 
            id="facility-select"
            value={selectedFacility}
            onChange={(e) => handleSelectFacility(Number(e.target.value))}
          >
            {facilities.map((facility, index) => (
              <option key={index} value={index}>
                {facility.name}
              </option>
            ))}
          </select>
          <div className="facility-count">
            {selectedFacility + 1} of {facilities.length} facilities
          </div>
        </div>
      )}
      
      <div className="pdf-container">
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => {
            console.error('Error loading PDF:', error);
            setError('Failed to load PDF document');
          }}
          loading={<div className="loading">Loading PDF...</div>}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page 
              key={`page_${index + 1}`} 
              pageNumber={index + 1} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pdf-page"
            />
          ))}
        </Document>
      </div>
      
      <div className="pdf-actions">
        <button onClick={handleDownload} className="download-btn">
          Download Current Facility
        </button>
        <button onClick={handleDownloadAll} className="download-all-btn">
          Download All Facilities
        </button>
        <button onClick={handleReturn} className="return-btn">
          Return to Upload
        </button>
      </div>
    </div>
  );
};

export default PdfPreview;