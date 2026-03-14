## ADDED Requirements

### Requirement: User login with credentials
The system SHALL authenticate users via email and password using NextAuth v5. Sessions SHALL be persisted via JWT.

#### Scenario: Successful login
- **WHEN** a user submits valid email and password
- **THEN** the system creates a session and redirects to the dashboard

#### Scenario: Invalid credentials
- **WHEN** a user submits an incorrect email or password
- **THEN** the system displays an error message and does not create a session

### Requirement: Role-based access control
The system SHALL enforce three roles: ADMIN, MEMBER, and VIEWER. Each role SHALL have distinct permissions enforced at the tRPC router level.

#### Scenario: ADMIN full access
- **WHEN** an ADMIN user accesses any module
- **THEN** the system allows read and write operations

#### Scenario: MEMBER write access
- **WHEN** a MEMBER user accesses an allowed module
- **THEN** the system allows create and update but restricts delete and admin actions

#### Scenario: VIEWER read-only access
- **WHEN** a VIEWER user accesses any module
- **THEN** the system allows only read operations and hides mutation controls

#### Scenario: Unauthorized mutation attempt
- **WHEN** a VIEWER attempts a mutation via API
- **THEN** the system returns UNAUTHORIZED error and rejects the request

### Requirement: User profile management
The system SHALL allow users to view and update their own profile, including name, avatar, and password.

#### Scenario: Update display name
- **WHEN** a user submits a new display name
- **THEN** the system updates the name and reflects the change in the UI immediately

#### Scenario: Change password
- **WHEN** a user submits current password and a new password (min 8 chars)
- **THEN** the system updates the password hash and invalidates other active sessions
