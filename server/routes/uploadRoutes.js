const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const db = require('../db/database');
const { parseCsvFile, parseExcelFile } = require('../utils/fileParser');
const { generateFacilityPdfs } = require('../utils/pdfGenerator');

module.exports = (upload) => {
  const router = express.Router();

  router.post('/', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      if (!req.body.facilityType) {
        return res.status(400).json({ message: 'No facility type specified' });
      }
      
      // Get file information
      const file = req.file;
      const facilityType = req.body.facilityType;
      const fileId = uuidv4();
      
      // Parse file based on extension
      const fileExtension = path.extname(file.originalname).toLowerCase();
      let facilityData;
      
      if (fileExtension === '.csv') {
        facilityData = await parseCsvFile(file.path, facilityType);
      } else if (['.xlsx', '.xls'].includes(fileExtension)) {
        facilityData = await parseExcelFile(file.path, facilityType);
      } else {
        return res.status(400).json({ message: 'Unsupported file format' });
      }
      
      if (!facilityData || facilityData.length === 0) {
        return res.status(400).json({ message: 'No valid data found in file' });
      }
      
      // Save file information to database
      await db.run(
        `INSERT INTO uploads (id, original_filename, file_path, facility_type, uploaded_at)
         VALUES (?, ?, ?, ?, ?)`,
        [fileId, file.originalname, file.path, facilityType, new Date().toISOString()]
      );
      
      // Save facility data to database
      for (const facility of facilityData) {
        const facilityId = uuidv4();
        
        await db.run(
          `INSERT INTO facilities (id, upload_id, name, data, facility_type)
           VALUES (?, ?, ?, ?, ?)`,
          [facilityId, fileId, facility.name, JSON.stringify(facility), facilityType]
        );
      }
      
      // Generate PDFs for each facility
      const pdfResults = await generateFacilityPdfs(facilityData, facilityType, fileId);
      
      // Return success response with upload ID
      res.status(200).json({
        message: 'File uploaded and processed successfully',
        id: fileId,
        pdfCount: pdfResults.length
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message || 'Error processing file' });
    }
  });

  return router;
};