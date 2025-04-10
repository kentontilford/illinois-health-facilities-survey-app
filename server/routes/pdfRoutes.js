const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const db = require('../db/database');

const router = express.Router();

// Get PDF preview by upload ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if upload exists
    const upload = await db.get('SELECT * FROM uploads WHERE id = ?', [id]);
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    
    // Get all facilities from this upload
    const facilities = await db.all('SELECT id, name FROM facilities WHERE upload_id = ?', [id]);
    
    if (!facilities || facilities.length === 0) {
      return res.status(404).json({ message: 'No facilities found for this upload' });
    }
    
    // Get the first facility's PDF for preview
    const firstFacilityId = facilities[0].id;
    const pdfPath = path.join(__dirname, '..', 'generated', `${firstFacilityId}.pdf`);
    
    // Check if the PDF exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    // Return the PDF URL and facility list
    res.json({
      pdfUrl: `/generated/${firstFacilityId}.pdf`,
      facilities: facilities
    });
  } catch (error) {
    console.error('Error getting PDF:', error);
    res.status(500).json({ message: 'Error retrieving PDF' });
  }
});

// Download specific facility PDF
router.get('/download/:uploadId/:facilityId', async (req, res) => {
  try {
    const { uploadId, facilityId } = req.params;
    
    // Check if facility exists
    const facility = await db.get(
      'SELECT f.*, u.original_filename FROM facilities f JOIN uploads u ON f.upload_id = u.id WHERE f.id = ? AND f.upload_id = ?',
      [facilityId, uploadId]
    );
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    const pdfPath = path.join(__dirname, '..', 'generated', `${facilityId}.pdf`);
    
    // Check if the PDF exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    // Set headers for file download
    const sanitizedName = facility.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedName}.pdf`);
    
    // Stream the file
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ message: 'Error downloading PDF' });
  }
});

// Download all PDFs as a ZIP file
router.get('/download-all/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // Check if upload exists
    const upload = await db.get('SELECT * FROM uploads WHERE id = ?', [uploadId]);
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    
    // Get all facilities from this upload
    const facilities = await db.all('SELECT id, name FROM facilities WHERE upload_id = ?', [uploadId]);
    
    if (!facilities || facilities.length === 0) {
      return res.status(404).json({ message: 'No facilities found for this upload' });
    }
    
    // Set headers for zip download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=facility_profiles.zip`);
    
    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Pipe archive to response
    archive.pipe(res);
    
    // Add each PDF to the archive
    for (const facility of facilities) {
      const pdfPath = path.join(__dirname, '..', 'generated', `${facility.id}.pdf`);
      
      if (fs.existsSync(pdfPath)) {
        const sanitizedName = facility.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        archive.file(pdfPath, { name: `${sanitizedName}.pdf` });
      }
    }
    
    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error('Error creating ZIP archive:', error);
    res.status(500).json({ message: 'Error creating ZIP archive' });
  }
});

module.exports = router;