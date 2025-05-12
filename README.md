# 🚀 Ghar.com &nbsp; ![Static Badge](https://img.shields.io/badge/status-live-brightgreen)

### 🔗 [Live Demo](https://ghar-dot-com.onrender.com/) • [GitHub](https://github.com/Tirth262830/Ghar-dot-com)


**Ghar.com** is a vacation rental and listing platform that is developed as part of showcasing full-stack web development skills. This project integrates **HTML**, **CSS**, **JavaScript**, **Node.js**, **EJS**, and **MongoDB** to provide an interactive and user-friendly platform for users to browse vacation listings and book properties.


## Features

- **User Registration & Login**: Secure user registration and authentication using Passport.js.
- **Property Listings**: Users can view and filter vacation rental properties.
- **Map Integration**: Embedded map view for easy property location tracking.
- **AI Chatbot**: Integrated chatbot to help answer user questions and provide support.
- **Admin Dashboard**: Admin can manage user accounts and property listings.
- **MongoDB Integration**: User and property data are stored securely in MongoDB Atlas.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (EJS templates)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Passport.js for user authentication
- **Session Management**: Express-session
- **File Upload**: Multer
- **Hosting**: Render

## Installation

To run this project locally, follow these steps:

### Prerequisites

- Node.js (version 16.x or higher)
- MongoDB Atlas account (for database)
- A code editor like VS Code
- Git (for version control)

### Steps

1. Clone the repository:
    ```bash
    git clone https://github.com/Tirth262830/Ghar-dot-com.git
    ```

2. Navigate to the project directory:
    ```bash
    cd Ghar-dot-com
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    SESSION_SECRET=your_session_secret
    NODE_ENV=development
    ```

5. Run the application:
    ```bash
    npm start
    ```

6. Open your browser and go to `http://localhost:3000` to view the app.

## MongoDB Configuration

For the MongoDB connection, you'll need to create a MongoDB Atlas account, set up a cluster, and retrieve your MongoDB URI. This URI will need to be added to your `.env` file as `MONGO_URI` to connect to the database.

## Deployment

The project is deployed on **Render**. Here's a brief guide to deploying it yourself:

1. Create an account on [Render](https://render.com/).
2. Link your GitHub repository to Render and set up a new web service.
3. Add your environment variables (`MONGO_URI`, `SESSION_SECRET`) in the **Environment** section.
4. Render will handle the deployment and automatically start the app.

## Purpose

This project is developed primarily to showcase my skills in full-stack web development and to demonstrate my experience with:

- Building web applications using modern technologies such as **Node.js**, **MongoDB**, and **Passport.js**.
- Designing interactive and user-friendly interfaces using **HTML**, **CSS**, and **JavaScript**.
- Integrating third-party services like **MongoDB Atlas** for database management and **Render** for cloud hosting.


