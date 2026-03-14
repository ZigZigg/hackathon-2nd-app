## ADDED Requirements

### Requirement: Work schedule management
The system SHALL allow ADMIN to create and publish weekly/monthly work schedules assigning shifts to employees.

#### Scenario: Create shift assignment
- **WHEN** an ADMIN assigns an employee to a shift on a given date
- **THEN** the system saves the shift and makes it visible to the employee

#### Scenario: View my schedule
- **WHEN** an employee opens the schedule page
- **THEN** the system displays their upcoming shifts in a weekly calendar view

### Requirement: Daily timesheet submission
The system SHALL allow employees to submit daily reports recording hours worked, tasks completed, and notes.

#### Scenario: Submit daily report
- **WHEN** an employee submits their daily timesheet with hours and activity summary
- **THEN** the system records the entry with date and employee reference

#### Scenario: ADMIN reviews timesheets
- **WHEN** an ADMIN views the timesheet list filtered by date
- **THEN** the system shows all submitted timesheets with employee names and hours

### Requirement: Timesheet approval workflow
The system SHALL allow ADMINs to approve or reject submitted timesheets.

#### Scenario: Approve timesheet
- **WHEN** an ADMIN approves a submitted timesheet
- **THEN** the system marks it approved and includes it in payroll calculations

#### Scenario: Reject timesheet with reason
- **WHEN** an ADMIN rejects a timesheet with a comment
- **THEN** the employee is notified and the timesheet returns to pending state for resubmission

### Requirement: Attendance summary report
The system SHALL provide a monthly attendance summary per employee showing total days worked, approved hours, and absences.

#### Scenario: Generate attendance summary
- **WHEN** an ADMIN selects a month and employee
- **THEN** the system displays a summary of attendance with totals for that period
