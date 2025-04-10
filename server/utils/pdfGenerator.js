const fs = require('fs-extra');
const path = require('path');
const PDFDocument = require('pdfkit-table');
const { v4: uuidv4 } = require('uuid');

// Load HFSRB branding info
const hfsrbBranding = require('../config/hfsrbBranding');

/**
 * Generate PDF reports for all facilities
 * @param {Array} facilityData - Array of facility data objects
 * @param {string} facilityType - Type of facility
 * @param {string} uploadId - ID of the upload
 * @returns {Promise<Array>} - Array of generated PDF paths
 */
const generateFacilityPdfs = async (facilityData, facilityType, uploadId) => {
  const results = [];
  
  // Process each facility
  for (const facility of facilityData) {
    try {
      // Generate a unique ID for the PDF if not provided
      const pdfId = facility.id || uuidv4();
      
      // Create PDF and save it
      const pdfPath = path.join(__dirname, '..', 'generated', `${pdfId}.pdf`);
      await generateSingleFacilityPdf(facility, pdfPath);
      
      results.push({
        facilityId: pdfId,
        pdfPath,
        success: true
      });
    } catch (error) {
      console.error(`Error generating PDF for ${facility.name}:`, error);
      results.push({
        facilityId: facility.id || 'unknown',
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
};

/**
 * Generate a PDF for a single facility
 * @param {Object} facility - Facility data object
 * @param {string} outputPath - Path to save the PDF
 * @returns {Promise<void>}
 */
const generateSingleFacilityPdf = (facility, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: 'LETTER',
        info: {
          Title: `${facility.name} - Facility Profile`,
          Author: 'Illinois Health Facilities and Services Review Board',
          Subject: 'Facility Survey Data'
        }
      });
      
      // Pipe output to file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Add header
      addHeader(doc, facility);
      
      // Add facility information
      addFacilityInformation(doc, facility);
      
      // Process each section
      Object.entries(facility.sections).forEach(([sectionName, fields], index) => {
        if (fields.length > 0) {
          if (index > 0) doc.addPage();
          addSection(doc, sectionName, fields);
        }
      });
      
      // Add footer on each page
      addFooter(doc);
      
      // Finalize the PDF
      doc.end();
      
      // When the stream is finished, resolve the promise
      stream.on('finish', () => {
        resolve(outputPath);
      });
      
      // If there's an error, reject the promise
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Add header to the PDF document
 * @param {PDFDocument} doc - PDF document
 * @param {Object} facility - Facility data object
 */
const addHeader = (doc, facility) => {
  // Set up header background
  doc.save()
    .fillColor(hfsrbBranding.colors.primary.navyBlue)
    .rect(50, 50, doc.page.width - 100, 80)
    .fill()
    .restore();
  
  // Add Illinois state outline (placeholder)
  doc.save()
    .translate(80, 75)
    .scale(0.15)
    .path('M50,0 L100,50 L80,100 L20,100 L0,50 Z') // Placeholder shape
    .fillColor(hfsrbBranding.colors.secondary.lightBlue)
    .fill()
    .restore();
  
  // Add title text
  doc.save()
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('white')
    .text('Illinois Health Facilities and Services Review Board', 140, 70)
    .fontSize(14)
    .text(`${facility.type.toUpperCase()} Facility Profile`, 140, 95)
    .restore();
  
  // Add date
  const today = new Date();
  doc.save()
    .fontSize(10)
    .font('Helvetica')
    .fillColor('white')
    .text(`Generated: ${today.toLocaleDateString()}`, doc.page.width - 200, 110, { align: 'right' })
    .restore();
  
  // Add space after header
  doc.moveDown(3);
};

/**
 * Add facility basic information to the PDF
 * @param {PDFDocument} doc - PDF document
 * @param {Object} facility - Facility data object
 */
const addFacilityInformation = (doc, facility) => {
  // Facility name banner
  doc.save()
    .fillColor(hfsrbBranding.colors.secondary.lightBlue)
    .rect(50, 140, doc.page.width - 100, 30)
    .fill()
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor(hfsrbBranding.colors.primary.navyBlue)
    .text(facility.name, 60, 148, { width: doc.page.width - 120 })
    .restore();
  
  doc.moveDown(2);
};

/**
 * Add a section of data to the PDF
 * @param {PDFDocument} doc - PDF document
 * @param {string} sectionName - Name of the section
 * @param {Array} fields - Array of field objects
 */
const addSection = (doc, sectionName, fields) => {
  // Section header
  doc.save()
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(hfsrbBranding.colors.primary.navyBlue)
    .text(sectionName, 50, doc.y)
    .moveDown(0.5)
    .restore();
  
  // Section separator line
  doc.save()
    .strokeColor(hfsrbBranding.colors.primary.navyBlue)
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke()
    .moveDown(1)
    .restore();
  
  // Prepare table data
  const tableData = {
    headers: ['Field', 'Value'],
    rows: fields.map(field => [field.description, field.value?.toString() || 'N/A'])
  };
  
  // Calculate available space
  const availableHeight = doc.page.height - doc.y - 100; // Leave space for footer
  
  // Check if table fits on current page
  if (fields.length * 25 > availableHeight) {
    doc.addPage();
    
    // Add section header again on new page
    doc.save()
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(hfsrbBranding.colors.primary.navyBlue)
      .text(sectionName + ' (continued)', 50, 50)
      .moveDown(0.5)
      .restore();
    
    // Section separator line
    doc.save()
      .strokeColor(hfsrbBranding.colors.primary.navyBlue)
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown(1)
      .restore();
  }
  
  // Draw table
  doc.table(tableData, {
    width: doc.page.width - 100,
    x: 50,
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
    prepareRow: (row, i) => doc.font('Helvetica').fontSize(10)
  });
  
  doc.moveDown(2);
};

/**
 * Add footer to each page of the PDF
 * @param {PDFDocument} doc - PDF document
 */
const addFooter = (doc) => {
  const pages = doc.bufferedPageRange();
  
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    
    // Footer line
    doc.save()
      .strokeColor(hfsrbBranding.colors.secondary.lightBlue)
      .lineWidth(1)
      .moveTo(50, doc.page.height - 50)
      .lineTo(doc.page.width - 50, doc.page.height - 50)
      .stroke()
      .restore();
    
    // Page number
    doc.save()
      .fontSize(10)
      .font('Helvetica')
      .fillColor(hfsrbBranding.colors.primary.navyBlue)
      .text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 40,
        { align: 'center', width: doc.page.width - 100 }
      )
      .restore();
    
    // HFSRB footer text
    doc.save()
      .fontSize(8)
      .font('Helvetica')
      .fillColor(hfsrbBranding.colors.primary.navyBlue)
      .text(
        'Illinois Health Facilities and Services Review Board',
        50,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 100 }
      )
      .restore();
  }
};

module.exports = {
  generateFacilityPdfs
};