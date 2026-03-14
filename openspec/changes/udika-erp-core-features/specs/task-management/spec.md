## ADDED Requirements

### Requirement: Kanban board display
The system SHALL display tasks in a Kanban board with columns representing status stages: Todo, In Progress, Review, and Done.

#### Scenario: Board renders with columns
- **WHEN** a user navigates to the task management module
- **THEN** the system displays all tasks organized into their respective status columns

#### Scenario: Empty column state
- **WHEN** a column has no tasks
- **THEN** the column displays a placeholder indicating no tasks in that stage

### Requirement: Task creation and assignment
The system SHALL allow creation of tasks with title, description, priority, due date, assignee, and optional event link.

#### Scenario: Create task
- **WHEN** a MEMBER submits the task creation form with title and assignee
- **THEN** the system creates the task in the Todo column and notifies the assignee

#### Scenario: Link task to event
- **WHEN** a task is created with an event reference
- **THEN** the task appears in both the task board and the linked event's detail page

### Requirement: Task status transitions
The system SHALL allow drag-and-drop or manual status updates to move tasks between Kanban columns.

#### Scenario: Drag task to new column
- **WHEN** a user drags a task card to a different column
- **THEN** the system updates the task status and persists the change

#### Scenario: Manual status change
- **WHEN** a user selects a new status from the task detail panel
- **THEN** the system updates the status and reflects the change on the board

### Requirement: Task filtering and search
The system SHALL allow filtering tasks by assignee, priority, due date, and linked event.

#### Scenario: Filter by assignee
- **WHEN** a user selects an assignee filter
- **THEN** the board shows only tasks assigned to that person

#### Scenario: Overdue task highlight
- **WHEN** a task's due date has passed and it is not in Done status
- **THEN** the task card displays a visual overdue indicator
