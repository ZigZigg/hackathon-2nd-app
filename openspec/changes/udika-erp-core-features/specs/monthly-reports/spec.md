## ADDED Requirements

### Requirement: Monthly report template generation
The system SHALL generate monthly business reports combining revenue, event summary, timesheet, and expense data for a selected month.

#### Scenario: Generate monthly report
- **WHEN** an ADMIN selects a month and clicks "Generate Report"
- **THEN** the system compiles all relevant data and presents a report preview

#### Scenario: Empty period report
- **WHEN** no data exists for the selected month
- **THEN** the system generates a report with zero values and appropriate notes

### Requirement: Export report as PDF
The system SHALL allow exporting monthly reports as formatted PDF documents.

#### Scenario: Export to PDF
- **WHEN** a user clicks "Export PDF" on a generated report
- **THEN** the system downloads a formatted PDF with all report sections

### Requirement: Export report as Excel
The system SHALL allow exporting monthly reports as Excel (.xlsx) spreadsheets with separate sheets per data category.

#### Scenario: Export to Excel
- **WHEN** a user clicks "Export Excel" on a generated report
- **THEN** the system downloads an .xlsx file with sheets for revenue, events, timesheets, and expenses

### Requirement: Report history
The system SHALL maintain a list of previously generated reports with metadata (date, generator, format).

#### Scenario: View report history
- **WHEN** a user opens the reports module
- **THEN** the system displays a list of past reports with download links
