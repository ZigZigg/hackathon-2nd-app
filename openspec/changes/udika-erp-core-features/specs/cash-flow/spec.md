## ADDED Requirements

### Requirement: Income and expenditure recording
The system SHALL allow recording of income and expense transactions with amount, category, description, date, and optional event reference.

#### Scenario: Record income transaction
- **WHEN** an ADMIN or MEMBER submits an income entry
- **THEN** the system saves the transaction and updates the cash flow balance

#### Scenario: Record expense transaction
- **WHEN** an ADMIN or MEMBER submits an expense entry
- **THEN** the system saves the transaction and deducts from the running balance

#### Scenario: Link transaction to event
- **WHEN** a transaction is created with an event reference
- **THEN** the transaction appears in both the cash flow list and the event's financial summary

### Requirement: Cash flow report
The system SHALL display a cash flow report showing income, expenses, and net balance for a selected period.

#### Scenario: View monthly cash flow
- **WHEN** a user selects a month
- **THEN** the system displays total income, total expenses, and net balance for that month

#### Scenario: View transaction list
- **WHEN** a user views the cash flow page
- **THEN** the system displays a paginated, date-sorted list of all transactions

### Requirement: Transaction categories
The system SHALL support configurable income and expense categories (e.g., Event Revenue, Staff Cost, Equipment Rental).

#### Scenario: Filter by category
- **WHEN** a user applies a category filter
- **THEN** only transactions of that category are shown in the list

#### Scenario: Category breakdown chart
- **WHEN** a user views the cash flow dashboard
- **THEN** the system shows a chart with expense and income breakdown by category
