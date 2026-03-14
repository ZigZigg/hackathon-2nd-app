## ADDED Requirements

### Requirement: Event creation and management
The system SHALL allow creation of events/programs with details including name, date, venue, type, customer, budget, and assigned team members.

#### Scenario: Create event
- **WHEN** an ADMIN or MEMBER submits the event creation form
- **THEN** the system creates the event and adds it to the event list

#### Scenario: Update event status
- **WHEN** an authorized user changes the event status (e.g., Planning → Confirmed → Completed)
- **THEN** the system updates the status and logs the change with timestamp

### Requirement: Quotation management
The system SHALL allow creation, editing, and sending of quotations linked to events, with line items for services and pricing.

#### Scenario: Create quotation
- **WHEN** a MEMBER creates a quotation for an event with line items
- **THEN** the system calculates totals and saves the quotation linked to that event

#### Scenario: Export quotation to Google Drive
- **WHEN** a user clicks "Export to Drive"
- **THEN** the system generates a PDF, uploads it to Google Drive, and returns a shareable link

#### Scenario: Send quotation to customer
- **WHEN** a user triggers "Send Quotation"
- **THEN** the system sends the quotation link to the customer via Zalo and records the action

### Requirement: Team coordination
The system SHALL allow assignment of staff and collaborators to events with role designation.

#### Scenario: Assign team member
- **WHEN** an ADMIN assigns a staff member to an event with a role
- **THEN** the system saves the assignment and notifies the staff member

#### Scenario: View event team
- **WHEN** a user views an event detail page
- **THEN** the system displays all assigned team members with their roles

### Requirement: Event list and calendar view
The system SHALL display events in both list and calendar views, filterable by status, date range, and event type.

#### Scenario: Calendar view renders
- **WHEN** a user switches to calendar view
- **THEN** the system displays events on their scheduled dates in a monthly calendar grid

#### Scenario: Filter by status
- **WHEN** a user applies a status filter
- **THEN** only events with the selected status appear in list and calendar views
