# Imposter Game – Web Prototype

A web-based multiplayer Imposter party game developed as a prototype and backup implementation for a university team project.

This version was independently designed and implemented to explore multiplayer state management, backend API design, and real-time game flow control using Node.js and Express.

---

## Overview

This project demonstrates:

- Multiplayer room creation and management
- Host-controlled game flow
- Game state transitions (lobby → playing → voting → ended)
- In-memory session handling
- Client-server communication using REST APIs
- Deployment to a live production environment (Render)

The goal of this version was to create a functional, browser-based implementation of the game concept while focusing on backend architecture and multiplayer synchronization.

---

## Tech Stack

- Node.js
- Express.js
- Vanilla JavaScript (Frontend)
- REST API architecture
- Render (Deployment)

---

## Key Features

- Online room-based multiplayer sessions
- Local play mode (single-device gameplay)
- Host-controlled game start validation
- REST API-driven game initialization
- In-memory server-side session management
- Client-side session persistence using localStorage
- Public cloud deployment (Render)

---

## Architecture

The application follows a server-authoritative design:

- The backend maintains a `rooms` object in memory.
- Each room tracks:
  - Host ID
  - Player list
  - Imposter
  - Chosen Word
  - Hidden Word
- Clients poll the server for state changes and update UI accordingly.

This ensures consistent multiplayer flow and prevents client-side manipulation of game state.

---

## Deployment

The application is deployed publicly using Render:

Note: Since room data is stored in memory, active sessions reset if the server restarts. This is acceptable for short-lived party-style gameplay.

---

## Purpose

This project was built as:

- A backup implementation for a collaborative university team project
- A working prototype to test multiplayer architecture
- A demonstration of backend-driven game state control
- A portfolio project showcasing full-stack development skills

---

## Future Improvements

- WebSocket integration (Socket.io) for real-time updates
- Persistent storage with a database
- User authentication
- Enhanced UI/UX design
- Scalable session management

---

## Author

Developed by Sajid Akhalwaya
Computer Science Undergraduate
