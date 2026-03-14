## ADDED Requirements

### Requirement: Revenue and profit metrics display
The system SHALL display total revenue, total costs, and net profit for the current month and year on the dashboard.

#### Scenario: Dashboard loads with current period metrics
- **WHEN** an authenticated user opens the dashboard
- **THEN** the system displays current month revenue, costs, and profit as summary cards

#### Scenario: Period filter applied
- **WHEN** a user selects a different month/year period
- **THEN** the dashboard updates all metrics and charts to reflect the selected period

### Requirement: Revenue trend chart
The system SHALL display a line or bar chart showing monthly revenue trends for the past 12 months.

#### Scenario: Chart renders with data
- **WHEN** revenue data exists for the past months
- **THEN** the chart plots monthly totals in chronological order

#### Scenario: Chart shows empty state
- **WHEN** no revenue data exists for a period
- **THEN** the chart displays zero values for those months with a "No data" indicator

### Requirement: Event category breakdown
The system SHALL display a pie or donut chart showing the distribution of events by category/type.

#### Scenario: Event breakdown renders
- **WHEN** events exist with different types
- **THEN** the chart shows proportional slices per event type with labels

### Requirement: Dashboard data refresh
The system SHALL refresh dashboard data every 30 seconds without full page reload.

#### Scenario: Auto-refresh triggers
- **WHEN** 30 seconds have passed since last data load
- **THEN** the dashboard silently fetches and updates metrics without disrupting user interaction
