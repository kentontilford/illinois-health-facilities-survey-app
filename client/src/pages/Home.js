import React from 'react';
import FileUpload from '../components/FileUpload';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h2>Illinois Health Facilities Survey Data Processor</h2>
        <p>
          Upload facility survey data to generate beautifully formatted PDF profiles for healthcare facilities in Illinois.
        </p>
      </section>
      
      <section className="upload-section">
        <h3>Upload Survey Data</h3>
        <FileUpload />
      </section>
      
      <section className="instructions">
        <h3>How It Works</h3>
        <ol>
          <li>Select the facility type (Hospital, ASTC, ESRD, or LTC)</li>
          <li>Upload a CSV or Excel file containing survey data</li>
          <li>The system will process the data and generate PDF profiles</li>
          <li>Preview and download the generated PDFs</li>
        </ol>
        <p className="note">
          <strong>Note:</strong> The uploaded file should follow the specified format where each row represents a facility's responses and each column represents a survey question.
        </p>
      </section>
    </div>
  );
};

export default Home;