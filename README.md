# Vedaz Assignment Chat Application

A full-stack real-time chat application built with React Native (Expo) for the mobile client and Node.js/Express/MongoDB for the backend server. Features include user authentication, real-time messaging, online status, and typing indicators.

---

## Folder Structure

```
Vedaz Assingment/
├── mobile/   # React Native client
├── server/   # Node.js/Express backend
```

---

## Setup Instructions

### Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd Vedaz Assingment
```

### 2. Server Setup
```sh
cd server
npm install
```

#### Environment Variables
Create a `.env` file in the `server/` folder:
```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
PORT=5000
```

### 3. Mobile Setup
```sh
cd ../mobile
npm install
```

---

## Running the Project

### Start the Server
```sh
cd server
npm start
```

### Start the Mobile App
```sh
cd mobile
npm start
```
- Use Expo Go app on your phone or an emulator to run the app.
- I used ngrok for connecting backend apis due to network and firewall issues if no problem go with localhost
---

## Environment Variables (Server)
| Variable      | Description                |
|--------------|---------------------------|
| MONGO_URI    | MongoDB connection string |
| JWT_SECRET   | Secret for JWT signing    |
| PORT         | Server port (default 5000)|

---

## Sample Users
You can register new users via the app. Example:
- Username: `alice`, Password: `password123`
- Username: `bob`, Password: `password123`

---

## Features
- User registration & login
- JWT authentication
- Real-time chat (Socket.IO)
- Online/offline status
- Typing indicator
- Chat history

---

## Technologies Used
- **Mobile:** React Native, Expo, React Navigation, Axios, Socket.IO client
- **Server:** Node.js, Express, Socket.IO, MongoDB (Mongoose), JWT, bcrypt

