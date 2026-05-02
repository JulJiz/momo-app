# MOMO by Crayola

MOMO is a classroom creativity app that turns students' mobile devices into collaborative drawing tools. For Delivery 1, the project focuses on a simple real-time MVP: students join a session with a code, draw from a mobile client, and send strokes plus basic motion data to an Express + Socket.io server.

## Delivery 1 Scope

Included:

- Backend server with Node.js, Express and Socket.io.
- Student mobile client with HTML, CSS and vanilla JavaScript.
- Session creation, student join, session status and student monitoring contracts.
- Real-time events for drawing, session state, sensor data and basic feedback.
- In-memory data model for the first MVP.

Not included yet:

- Teacher Dashboard UI.
- Screen/Projector Client UI.
- Real QR generation.
- AI-based drawing similarity.
- Persistent database.
- Final visual design.

## Tech Stack

- Node.js
- Express
- Socket.io
- HTML
- CSS
- Vanilla JavaScript

The project intentionally avoids extra dependencies during Delivery 1 so it stays easy to understand, run and present for class.

## Local Run

Install dependencies and start the Express server:

```bash
npm install
npm start
```

Expected local server URL:

```text
http://localhost:5050
```

The student client will be opened from:

```text
client-student/index.html
```

For local configuration, copy `.env.example` to `.env` if custom values are needed:

```text
PORT=5050
CLIENT_ORIGIN=*
```

`PORT` controls the backend port. `CLIENT_ORIGIN` controls CORS and can stay as `*` during local Delivery 1 testing.

## Architecture Overview

```text
Student Mobile Client
  |-- HTTP REST: join session
  `-- Socket.io: draw, sensor, feedback

Express + Socket.io Server
  |-- REST API: sessions and monitor
  |-- WebSocket rooms: real-time session channels
  `-- In-memory store: sessions, students, strokes, sensor events

Future Teacher Dashboard
  `-- HTTP REST: create/control session and monitor students

Future Screen/Projector Client
  `-- Socket.io: listen to canvas-broadcast events
```

## Protocols

MOMO uses two communication styles:

- HTTP REST for discrete actions such as creating a session, joining a session, controlling the session and checking monitor data.
- Socket.io/WebSockets for real-time communication such as drawing strokes, sensor events, feedback and session state updates.

## Main REST API

Available endpoints for Delivery 1:

```text
GET  /health
POST /session/create
POST /session/join
GET  /session/monitor?session_code=ABC123
POST /session/control
```

### Create Session

```http
POST /session/create
```

Request body:

```json
{
  "duration_minutes": 10
}
```

Success response:

```json
{
  "session_code": "ABC123",
  "status": "waiting",
  "duration_seconds": 600
}
```

### Join Session

```http
POST /session/join
```

Request body:

```json
{
  "session_code": "ABC123",
  "device_id": "student-device-1",
  "nickname": "Student 1"
}
```

Success response:

```json
{
  "student_id": "student-device-1",
  "session_code": "ABC123",
  "status": "joined",
  "session_status": "waiting"
}
```

### Monitor Session

```http
GET /session/monitor?session_code=ABC123
```

Success response:

```json
{
  "session_code": "ABC123",
  "status": "waiting",
  "students": [],
  "time_remaining": 600
}
```

### Control Session

```http
POST /session/control
```

Request body:

```json
{
  "session_code": "ABC123",
  "action": "start"
}
```

Valid actions are `start`, `pause` and `end`.

Success response:

```json
{
  "session_code": "ABC123",
  "status": "active",
  "time_remaining": 600
}
```

The server also emits `session-state` through Socket.io to the session rooms after a successful control action.

## Main Socket.io Events

Available events for Delivery 1:

```text
join-session      Student -> Server
session-state     Server  -> Student
draw              Student -> Server
canvas-broadcast  Server  -> Session rooms
sensor            Student -> Server
feedback          Server  -> Student
```

Socket.io path:

```text
/real-time
```

Room naming:

```text
session:{session_code}
session:{session_code}:screen
```

### Join a Socket.io Room

Students join the session room after a successful `POST /session/join`:

```json
{
  "session_code": "ABC123",
  "device_id": "student-device-1",
  "role": "student"
}
```

The future projector screen will use the same event with `role: "screen"` and will join `session:{session_code}:screen`.

After joining, the server emits:

```json
{
  "session_code": "ABC123",
  "status": "waiting",
  "time_remaining": 600
}
```

### Send Drawing Data

Students emit `draw` while interacting with the canvas:

```json
{
  "session_code": "ABC123",
  "device_id": "student-device-1",
  "x": 120,
  "y": 80,
  "prev_x": 110,
  "prev_y": 76,
  "color": "#ff0000",
  "brush_type": "medium",
  "brush_size": 4,
  "sequence": 1
}
```

The server stores the stroke and emits `canvas-broadcast` to:

```text
session:{session_code}
session:{session_code}:screen
```

### Send Sensor Data

Students emit `sensor` with throttled movement data:

```json
{
  "session_code": "ABC123",
  "device_id": "student-device-1",
  "tilt": {
    "alpha": 0,
    "beta": 10,
    "gamma": -4
  },
  "shake": false,
  "orientation": "portrait"
}
```

If `shake` is `true`, the server emits `feedback` to that student:

```json
{
  "points": 1,
  "message": "MOMO vio tu movimiento"
}
```

## Data Model for Delivery 1

Delivery 1 starts with an in-memory store located in `server/src/services/sessionStore.js`. This keeps the MVP simple and can later be migrated to Supabase without changing the public API contracts.

Current schema-like shape:

```text
Session
- session_code: unique six-character classroom code
- status: waiting | active | paused | ended
- created_at: timestamp
- duration_seconds: configured session duration
- remaining_seconds: remaining session time
- started_at: timestamp or null
- paused_at: timestamp or null
- ended_at: timestamp or null
- students: collection of Student records
- strokes: collection of Stroke records
- sensor_events: collection of SensorEvent records

Student
- student_id: same value as device_id for Delivery 1
- device_id: browser/device identifier sent by the student client
- nickname: display name
- status: idle | drawing
- connected: boolean
- joined_at: timestamp
- last_active_at: timestamp

Stroke
- session_code: parent session
- device_id: student device id
- x, y: current coordinates
- prev_x, prev_y: previous coordinates or null
- color: selected drawing color
- brush_type: selected tool or brush name
- brush_size: numeric brush size
- sequence: stroke ordering number
- created_at: timestamp

SensorEvent
- session_code: parent session
- device_id: student device id
- tilt: device orientation values
- shake: boolean
- orientation: portrait, landscape or null
- created_at: timestamp
```

There is no database export in Delivery 1 because persistence is intentionally in memory. When the project moves to Supabase later, this section should become the base for the required schema/export.

## Demo Notes

The Delivery 1 demo should prove the main flow without changing code during the presentation:

1. Start the server.
2. Create a session through the REST API.
3. Open the student client.
4. Join with the session code.
5. Start the session through the REST API.
6. Draw from the student client.
7. Confirm real-time events and feedback.

Deployment and public URL support are planned after the local MVP is stable.
