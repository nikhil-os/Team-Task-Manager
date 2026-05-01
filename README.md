# Team Task Manager

Hey there! Welcome to my Team Task Manager project. I built this web application to help teams stay organized, manage their projects, and keep track of who is doing what without all the usual chaos.

## What is this?
It's a full-stack project management tool. You can think of it like a mini Jira or Trello, but designed to be clean, fast, and simple. It uses a very sleek, dark charcoal-to-teal gradient theme because I wanted it to look premium and professional.

## Features
- **Role-based Access:** Admins have the power to create projects and assign tasks. Team Members get a focused view of exactly what they need to work on.
- **Interactive Dashboard:** As soon as you log in, you see big clickable cards that break down project stats, completion rates, and overdue items.
- **Smart Task Boards:** Admins see a full Kanban board to track everything. Members see a clean, personalized list of their own tasks.
- **Real-time Status Updates:** No page reloads needed when moving tasks from "To Do" to "Done".

## Tech Stack
- **Frontend:** React.js, Vite, and custom CSS (no heavy styling frameworks here!).
- **Backend:** Node.js and Express.js.
- **Database:** MongoDB (using Mongoose).
- **Authentication:** Secure JWT tokens and bcrypt password hashing.

## How to run it locally
If you want to spin this up on your own machine, it's super easy:

1. Clone this repository.
2. Open your terminal in the main folder and run:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```
3. Make sure you have a `.env` file in the `backend` folder with your `MONGODB_URI` and `JWT_SECRET`.
4. Run the build and start the server:
   ```bash
   npm run build
   npm start
   ```
5. Open your browser and go to `http://localhost:5000`.

## Deployment
This app is fully production-ready and designed to be deployed directly to Railway. The `nixpacks.toml` and `package.json` handle the full-stack build process automatically, so pushing to your main branch deploys both the frontend and backend at once!

Enjoy! Let me know if you find any bugs or have feature ideas.
