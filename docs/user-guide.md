### docs/user-guide.md

```markdown
# User Guide

This guide provides instructions for using the Illinois Health Facilities Survey Data Processor application.

## Getting Started

1. Open the application in your web browser.
2. You will see the main interface with an upload section.

## Uploading Survey Data

1. Select the facility type from the dropdown menu:
   - Hospital
   - Ambulatory Surgical Treatment Center (ASTC)
   - End-Stage Renal Disease Facility (ESRD)
   - Long-Term Care Facility (LTC)

2. Drag and drop a CSV or Excel file into the upload area, or click to browse for a file.
   - The file should contain survey data where each row represents a facility's responses and each column represents a survey question.
   - The column headers should match the field names in the respective facility definition files.

3. Click the "Generate PDF Profiles" button to process the file.

## Previewing Generated PDFs

After successful upload and processing:

1. You will be redirected to the preview page.
2. Use the facility selector dropdown to navigate between different facilities.
3. The PDF preview will display the formatted facility profile.

## Downloading PDFs

From the preview page, you have two options:

1. **Download Current Facility**: Downloads the PDF for the currently selected facility.
2. **Download All Facilities**: Downloads a ZIP file containing PDFs for all facilities.

## File Format Requirements

### Hospital Survey Data

The CSV or Excel file should include fields defined in the hospital definitions, such as:
- hname (Hospital Name)
- hstreet (Hospital Street Address)
- hcity (Hospital City)
- And other relevant fields from the hospital questionnaire

### ASTC Survey Data

The CSV or Excel file should include fields defined in the ASTC definitions, such as:
- ASTCName (ASTC Name)
- ASTCStreet (ASTC Street Address)
- ASTCCity (ASTC City)
- And other relevant fields from the ASTC questionnaire

### ESRD Survey Data

The CSV or Excel file should include fields defined in the ESRD definitions, such as:
- Facility (Facility Name)
- Address (Facility Address)
- City (Facility City)
- And other relevant fields from the ESRD questionnaire

### LTC Survey Data

The CSV or Excel file should include fields defined in the LTC definitions, such as:
- Facility Name
- Facility Address
- Facility City
- And other relevant fields from the LTC questionnaire

## Troubleshooting

If you encounter any issues:

1. Ensure your file format is correct (CSV or Excel).
2. Check that column headers match the expected field names.
3. Verify that the file contains valid data.
4. For large files, allow sufficient time for processing.