## ADDED Requirements

### Requirement: Employee profile management
The system SHALL allow management of full-time employee records including name, role, department, contact, hire date, and salary information.

#### Scenario: Create employee record
- **WHEN** an ADMIN submits a new employee form
- **THEN** the system creates the employee record and links it to a system user account if applicable

#### Scenario: Update employee information
- **WHEN** an ADMIN edits an employee's details
- **THEN** the system saves the changes and logs the update with timestamp

#### Scenario: View employee directory
- **WHEN** any authenticated user opens the HR module
- **THEN** the system displays a searchable list of all active employees

### Requirement: Collaborator management
The system SHALL allow management of external collaborators (freelancers, contractors) with name, specialty, contact, and availability status.

#### Scenario: Add collaborator
- **WHEN** an ADMIN adds a new collaborator record
- **THEN** the system saves the collaborator as distinct from full-time employees

#### Scenario: Assign collaborator to event
- **WHEN** an ADMIN assigns a collaborator to an event
- **THEN** the collaborator appears in the event's team list alongside employees

### Requirement: HR document and contract tracking
The system SHALL track employment contracts and key HR documents with upload date and expiry status.

#### Scenario: Log contract record
- **WHEN** an ADMIN records a contract with start and end dates
- **THEN** the system saves the record and marks it as expiring when the end date is within 30 days

#### Scenario: View expiring contracts
- **WHEN** an ADMIN views the HR dashboard
- **THEN** contracts expiring within 30 days are highlighted with a warning indicator
