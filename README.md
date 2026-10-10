# Survey App

A web application for creating surveys, sharing them publicly, and collecting written responses. Users can register, manage their own surveys, and review submitted responses.

## Features

- Register and sign in with an email address and password.
- Create surveys with a title, description, category, and target audience.
- Browse surveys shared by all users and submit a written response without signing in.
- View and manage your own surveys and read their responses.
- Store users, surveys, and responses in MongoDB.

## Requirements

- Node.js and npm
- A MongoDB database, such as a MongoDB Atlas cluster

## Setup

1. Clone or download this repository and open its folder in a terminal.
2. Install the dependencies:

	```bash
	npm install
	```

3. Create a `.env` file in the project root with your database connection string and a secret used to sign login tokens:

	```env
	MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
	JWT_SECRET=replace-this-with-a-long-random-secret
	PORT=3000
	```

	`MONGODB_URI` is required. If `PORT` is omitted, the app uses port `3000`. Keep `.env` private and use a strong, unique `JWT_SECRET`, especially outside local development.

4. Start the application:

	```bash
	npm start
	```

	For development, `npm run dev` starts the same Node.js process.

5. Open [http://localhost:3000](http://localhost:3000) (or the port configured in `.env`).

The server connects to MongoDB before it starts listening. For MongoDB Atlas, make sure the database user credentials are correct and your IP address is permitted in the cluster's network access settings.

## Using the App

1. Register an account or sign in.
2. From your dashboard, create a survey or browse available surveys.
3. Share a survey by directing people to its response page. Respondents can submit a response without an account.
4. Open **Your Surveys** and select a survey's responses to review submissions.

Survey titles must be at least 3 characters long, descriptions at least 10 characters long, and responses no longer than 2,000 characters.

## Main Pages

| Page | Path | Access |
| --- | --- | --- |
| Home | `/` | Public |
| Register | `/register` | Public |
| Sign in | `/login` | Public |
| Dashboard | `/profile` | Signed-in users |
| Create a survey | `/createyoursurvey` | Signed-in users |
| Your surveys | `/yoursurveys` | Signed-in users |
| Browse surveys | `/readsurvey` | Public |
| Respond to a survey | `/survey/:id/respond` | Public |
| View a survey's responses | `/survey/:id/responses` | Survey owner |

## Technology

- Node.js and Express
- EJS templates
- MongoDB with Mongoose
- bcrypt password hashing and JSON Web Token authentication
- Tailwind CSS loaded by the views from its browser CDN
