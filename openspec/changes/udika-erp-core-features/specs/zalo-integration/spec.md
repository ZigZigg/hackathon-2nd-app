## ADDED Requirements

### Requirement: Send Zalo messages to customers
The system SHALL allow sending text messages to customers via Zalo OA API from within the CRM and event management modules.

#### Scenario: Send message from customer profile
- **WHEN** a MEMBER clicks "Send Zalo Message" on a customer profile and submits the message form
- **THEN** the system sends the message via Zalo OA API and records it in the message history

#### Scenario: API failure handling
- **WHEN** the Zalo API returns an error
- **THEN** the system displays an error notification and queues the message for retry via Inngest

### Requirement: Zalo message history
The system SHALL maintain a log of all Zalo messages sent to each customer with timestamp, content, sender, and delivery status.

#### Scenario: View message history
- **WHEN** a user opens a customer's Zalo message history
- **THEN** the system displays all past messages in chronological order with status indicators

### Requirement: Webhook receiver for incoming messages
The system SHALL receive and process incoming Zalo webhook events for customer replies.

#### Scenario: Incoming message received
- **WHEN** a customer replies via Zalo
- **THEN** the webhook endpoint receives the event, stores the message, and displays it in the customer's message history

#### Scenario: Webhook signature validation
- **WHEN** a webhook request arrives without a valid Zalo signature
- **THEN** the system rejects the request with a 401 response

### Requirement: Bulk Zalo message sending
The system SHALL allow sending template-based Zalo messages to multiple customers (e.g., event reminders, quotation follow-ups).

#### Scenario: Send bulk message
- **WHEN** an ADMIN selects multiple customers and a message template and confirms
- **THEN** the system queues individual messages via Inngest and sends them with rate limiting
