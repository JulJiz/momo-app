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

## Planned Local Run

The runnable server starts in commit `1.1`. Once that commit is implemented, the local flow will be:

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

## Main REST Contracts

Planned endpoints for Delivery 1:

```text
GET  /health
POST /session/create
POST /session/join
GET  /session/monitor?session_code=ABC123
POST /session/control
```

## Main Socket.io Events

Planned events for Delivery 1:

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

## Data Model for Delivery 1

Delivery 1 starts with an in-memory store. The planned entities are:

- `Session`: session code, status, creation time, duration, start time, students, strokes and sensor events.
- `Student`: device id, nickname, connection state and activity status.
- `Stroke`: coordinates, previous coordinates, color, brush type, brush size, sequence, timestamp and student id.
- `SensorEvent`: device tilt, shake flag, orientation, timestamp and student id.

If the project moves to SQLite later, this section should become the base for the schema/export required by the repository rubric.

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
