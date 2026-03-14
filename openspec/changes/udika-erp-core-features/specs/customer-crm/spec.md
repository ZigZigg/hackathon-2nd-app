## ADDED Requirements

### Requirement: Customer profile management
The system SHALL allow creation and management of customer profiles including name, phone, email, company, and address.

#### Scenario: Create customer
- **WHEN** an ADMIN or MEMBER submits a new customer form with name and phone
- **THEN** the system creates the customer record and displays it in the customer list

#### Scenario: Edit customer
- **WHEN** an ADMIN or MEMBER updates customer information
- **THEN** the system saves the changes and reflects them immediately

#### Scenario: View customer list
- **WHEN** a user navigates to the CRM module
- **THEN** the system displays a paginated, searchable list of all customers

### Requirement: Customer interaction history
The system SHALL record and display a chronological history of all interactions with each customer, including calls, meetings, and messages.

#### Scenario: Add interaction note
- **WHEN** a MEMBER logs a new interaction for a customer
- **THEN** the system saves the interaction with timestamp and displays it in the customer's history

#### Scenario: View interaction history
- **WHEN** a user opens a customer profile
- **THEN** the system displays all past interactions in reverse chronological order

### Requirement: Customer search and filter
The system SHALL allow searching customers by name, phone, or email, and filtering by status or assigned staff.

#### Scenario: Search by name
- **WHEN** a user types in the search box
- **THEN** the system filters the customer list to matching records in real-time

#### Scenario: Filter by status
- **WHEN** a user selects a status filter (e.g., Active, Prospect, Inactive)
- **THEN** the system shows only customers with that status
