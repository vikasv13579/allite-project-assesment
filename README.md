Allite Project Assessment

This project is a Node.js application that provides APIs that can be tested locally after completing the setup steps below.

Project Setup
Prerequisites

Before running the project, make sure you have the following installed:

Node.js — Latest LTS version
Git
npm — Comes with Node.js
Step 1: Clone the Repository

Clone the project from GitHub:

git clone https://github.com/vikasv13579/allite-project-assesment.git

Step 2: Navigate to the Project Directory
cd allite-project-assesment

Step 3: Install Dependencies

Install all required Node.js dependencies:

npm install

Step 4: Start the Application

Run the application locally:

npm start


The server will run on:

http://localhost:5000

API Testing

Once the server is running, you can test the available APIs using tools such as:

Postman
Thunder Client
cURL
Any API testing tool

Use the following base URL for the APIs:

http://localhost:5000

Example
GET http://localhost:5000/<api-endpoint>


Replace <api-endpoint> with the appropriate API route available in the project.

Project Structure
allite-project-assesment/
├── node_modules/
├── src/
├── package.json
├── package-lock.json
└── README.md


Note: Do not commit the node_modules folder to GitHub. It can be recreated by running npm install.

Running the Project

In summary:

git clone https://github.com/vikasv13579/allite-project-assesment.git
cd allite-project-assesment
npm install
npm start


The application will be available at:

http://localhost:5000

You can now test the APIs locally.
