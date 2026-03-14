## ADDED Requirements

### Requirement: Prop inventory catalog
The system SHALL maintain a catalog of event props with name, category, quantity, condition, storage location, and photos.

#### Scenario: Add prop to catalog
- **WHEN** an ADMIN submits a new prop entry with name and quantity
- **THEN** the system adds the prop to the inventory catalog

#### Scenario: Update prop quantity
- **WHEN** a MEMBER updates the available quantity of a prop
- **THEN** the system records the change and updates the current stock count

#### Scenario: View inventory list
- **WHEN** a user opens the inventory module
- **THEN** the system displays all props with their current quantities and conditions

### Requirement: Prop allocation to events
The system SHALL allow allocation of specific props to events, tracking which props are in use for which event.

#### Scenario: Allocate prop to event
- **WHEN** an ADMIN assigns props to an event
- **THEN** the system marks those quantities as reserved for that event

#### Scenario: Detect over-allocation
- **WHEN** a prop allocation exceeds available stock
- **THEN** the system displays a warning and prevents the over-allocation from being saved

### Requirement: On-site checklist management
The system SHALL allow creation of pre-event and post-event on-site checklists linked to specific events.

#### Scenario: Create event checklist
- **WHEN** an ADMIN creates a checklist template for an event
- **THEN** the system saves the checklist with all items in unchecked state

#### Scenario: Mark checklist item complete
- **WHEN** a MEMBER checks off a checklist item on-site
- **THEN** the system saves the checked state with timestamp and user

#### Scenario: View checklist completion status
- **WHEN** a user views an event's checklist
- **THEN** the system shows overall completion percentage and individual item statuses
