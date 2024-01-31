#### Real-time Chatbot Application

Description:
    This application is a real-time AI chatbot built on Node.js with Express as the server framework. It facilitates interactive communication between users and the AI chatbot using Socket.io for a real-time experience. The application uses Sequelize as an ORM for PostgreSQL database interactions, managing user data and chat logs effectively. Authentication routes are also implemented to ensure secure user sign-up and login processes. Additionally, the server is set up with CORS to allow requests from a client application, which is expected to be hosted separately.

Features:

    Real-time Communication: Utilizes Socket.io to enable live chat interactions.
    User Authentication: Secure routes for user authentication, including sign-up and login functionalities.
    Database Integration: Uses Sequelize to interact with a PostgreSQL database for storing user data and chat histories.
    Logging Middleware: Incorporated middleware for request logging to aid in monitoring and debugging.
    CORS Configuration: Configured to allow cross-origin resource sharing, enabling the server to accept requests from the front-end client.
Error Handling: Robust error handling to ensure the server responds gracefully to client errors.


## Installation
    Clone the project repository:


        backend: git clone https://github.com/MohdKamranAlam/ai-enhanced-chatapp.git
        frontend:  git clone https://github.com/MohdKamranAlam/client.git
            Navigate to the project directory:


backend: cd ai-enhanced-chatapp
frontend: cd client

Install dependencies:

npm install
   .env configured already. no need to change thing for local environment.

 Start your PostgreSQL database server and ensure it's running.

## Initialize the database and models:


    The line "Initialize the database and models" refers to the process of setting up your PostgreSQL database with the necessary tables and relationships as defined by your Sequelize models. In a Node.js application using Sequelize, this usually involves running migrations that create the database schema or using Sequelize's sync function to automatically create tables based on your models.

    Here's a detailed explanation and instructions on how to do it:

## Sequelize Migrations (Recommended for Production)
    Migrations are a way to reliably create and change your database schema. They are scripts that handle schema changes and keep track of which changes have been applied to a database.

    Create Migrations: You would typically create migration files that define how to create your tables and modify them over time. Sequelize CLI can generate these files for you.

    <!-- create migration

        npx sequelize-cli migration:generate --name create-users
        npx sequelize-cli migration:generate --name create-chatlogs -->

    Run Migrations: Once you have your migration files set up, you run them to apply the changes to your database.

  ##  To craete the table into postgresql database
    Only this command will execute for creating table into database
     npx sequelize-cli db:migrate


   ## npm start or npm run dev (for local development environment)
    The server should now be up and running, listening for connections on the configured port.

Usage:  

    To use the chatbot application:

## Start the server as mentioned in the installation steps.
    Connect to the server using a web client at http://localhost:3000
    server: http://localhost:8084 
    
    Use the chat interface to interact with the AI chatbot in real-time.

Developer: Mohammad Kamran Alam
Project Repository: GitHub
    Frontend: <rhttps://github.com/MohdKamranAlam/client.git>,
    Backend: <rhttps://github.com/MohdKamranAlam/ai-enhanced-chatapp.git> 