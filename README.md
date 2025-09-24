# Route Scheduling System

A simple REST API for managing drivers and routes in a route scheduling system.  
Built with **Node.js**, **Express**, and **MongoDB**.

---

## 🚀 Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Sohailahesham/route-scheduling-system.git
   cd route-scheduling-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```env
   MONGO_URI=mongodb://localhost:27017/route-scheduling
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

The API should now be running at:  
`http://localhost:5000`

---

## 📌 Assumptions Made

1. **Unique identifiers**  
   - MongoDB’s `_id` is the primary identifier for drivers and routes.  
   - Company-specific IDs (like license number) are stored separately if needed.  

2. **Driver availability**  
   - A driver can only be `available = true` if they are not currently assigned to a route.  
   - A driver cannot be deleted while assigned to a route.  

3. **Route status lifecycle**  
   - Routes have three statuses: `unassigned`, `active`, `completed`.  
   - Status flow: `unassigned → active → completed`.  
   - A completed route cannot be reassigned.  

4. **Scheduling logic**  
   - Assignments pick the **first available driver** that matches requirements.  
   - `findOneAndUpdate` is used to prevent race conditions.    

---

## ✨ Features Implemented

- **Driver Management**  
  - Create, read, update, delete drivers.  
  - Filter and search drivers by availability, license type, name, or ID.  
  - Track driver history (completed routes).  

- **Route Management**  
  - Create, read, update, delete routes.  
  - Assign drivers to routes.  
  - Update route status (`unassigned`, `active`, `completed`).  

- **Scheduling**  
  - Fetch schedule information.
  - Return which driver is assigned to which route.

- **Error Handling**  
  - Centralized error handler using `appError` utility.  
  - Validation middleware for cleaner input handling.  

---

## 🛠 Tech Stack

- Node.js  
- Express  
- MongoDB + Mongoose  

---

## 📄 License

This project is for learning purposes and does not include a production license.
