// Import CSV data for hospital definitions
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Path to the definitions CSV file
const definitionsPath = path.join(__dirname, '..', '..', 'data', 'hospitaldefinitions.csv');

// Parse the CSV file if it exists
let definitions = [];

if (fs.existsSync(definitionsPath)) {
  const fileStream = fs.createReadStream(definitionsPath);
  
  fileStream
    .pipe(csv())
    .on('data', (data) => {
      // Add section field based on a pattern or categorization logic
      let section = 'General Information';
      
      // Categorize fields based on patterns in the field name
      if (data['Form Field Name']?.includes('adm')) {
        section = 'Admissions';
      } else if (data['Form Field Name']?.includes('ipd') || data['Form Field Name']?.includes('inpatient')) {
        section = 'Inpatient Information';
      } else if (data['Form Field Name']?.includes('op') || data['Form Field Name']?.includes('outpatient')) {
        section = 'Outpatient Information';
      } else if (data['Form Field Name']?.includes('FTE') || data['Form Field Name']?.includes('staff')) {
        section = 'Staffing';
      } else if (data['Form Field Name']?.includes('Rev') || data['Form Field Name']?.includes('revenue')) {
        section = 'Financial Information';
      }
      
      // Add section field to the data
      data.Section = section;
      
      definitions.push(data);
    });
}

module.exports = definitions;