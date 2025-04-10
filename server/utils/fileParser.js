const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');

// Load schema definitions
const hospitalDefinitions = require('../config/hospitalDefinitions');
const astcDefinitions = require('../config/astcDefinitions');
const esrdDefinitions = require('../config/esrdDefinitions');
const ltcDefinitions = require('../config/ltcDefinitions');

/**
 * Parse a CSV file and extract facility data
 * @param {string} filePath - Path to the CSV file
 * @param {string} facilityType - Type of facility (hospital, astc, esrd, ltc)
 * @returns {Promise<Array>} - Array of facility data objects
 */
const parseCsvFile = (filePath, facilityType) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        try {
          const facilityData = processFacilityData(results, facilityType);
          resolve(facilityData);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Parse an Excel file and extract facility data
 * @param {string} filePath - Path to the Excel file
 * @param {string} facilityType - Type of facility (hospital, astc, esrd, ltc)
 * @returns {Promise<Array>} - Array of facility data objects
 */
const parseExcelFile = (filePath, facilityType) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert worksheet to JSON
      const results = XLSX.utils.sheet_to_json(worksheet);
      
      const facilityData = processFacilityData(results, facilityType);
      resolve(facilityData);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Process raw facility data and format it according to facility type
 * @param {Array} rawData - Raw data from CSV/Excel file
 * @param {string} facilityType - Type of facility
 * @returns {Array} - Processed facility data
 */
const processFacilityData = (rawData, facilityType) => {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    throw new Error('No valid data found');
  }
  
  // Get the appropriate field definitions based on facility type
  let definitions;
  let nameField;
  
  switch (facilityType) {
    case 'hospital':
      definitions = hospitalDefinitions;
      nameField = 'hname';
      break;
    case 'astc':
      definitions = astcDefinitions;
      nameField = 'ASTCName';
      break;
    case 'esrd':
      definitions = esrdDefinitions;
      nameField = 'Facility';
      break;
    case 'ltc':
      definitions = ltcDefinitions;
      nameField = 'Facility Name';
      break;
    default:
      throw new Error(`Unknown facility type: ${facilityType}`);
  }
  
  return rawData.map((row, index) => {
    // Use facility name or default to 'Facility {index}'
    const name = row[nameField] || `Facility ${index + 1}`;
    
    // Create a structured data object for the facility
    const facilityData = {
      name,
      type: facilityType,
      sections: {}
    };
    
    // Group fields into sections
    definitions.forEach(def => {
      if (!def['Form Field Name'] || !def['Plain English Description']) return;
      
      const fieldName = def['Form Field Name'];
      const description = def['Plain English Description'];
      const section = def['Section'] || 'General Information';
      
      // Initialize section if it doesn't exist
      if (!facilityData.sections[section]) {
        facilityData.sections[section] = [];
      }
      
      // Add field to section
      if (row.hasOwnProperty(fieldName)) {
        facilityData.sections[section].push({
          name: fieldName,
          description,
          value: row[fieldName]
        });
      }
    });
    
    return facilityData;
  });
};

module.exports = {
  parseCsvFile,
  parseExcelFile
};