# SalesMarket CTIS256

SalesMarket CTIS256 is a Node.js and MySQL web application for discounted market products. Markets can add products with approaching expiration dates, and consumers can search discounted products in their city, add them to cart, and complete a purchase.

## Features

- Market and consumer registration
- Email verification for new accounts
- Login, logout, and session-based authentication
- Role-based page protection for market and consumer users
- Market profile management
- Product add, edit, delete, and image upload
- Consumer product search by keyword and city
- District-priority product listing
- Cart quantity update, remove, and purchase flow
- Stock update after purchase

## Technologies

- Node.js
- Express.js
- EJS
- MySQL
- Docker Compose
- express-session
- express-validator
- bcrypt
- multer
- nodemailer

## Project Structure

```text
config/              Multer upload configuration
middleware/          Role-based auth middleware
public/              Static CSS and client-side JavaScript
routes/              Auth, market, and consumer route modules
services/            Mail and cart helper services
sql/                 Database initialization script
views/               EJS page templates
db.js                MySQL connection pool
server.js            Express app entry point
docker-compose.yml   MySQL and phpMyAdmin setup
```

## Environment Variables

Create a `.env` file in the project root:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Use a Gmail app password for `EMAIL_PASS`.

## Installation

```bash
npm install
```

## Database Setup

Start MySQL and phpMyAdmin with Docker:

```bash
docker compose up -d
```

The database tables are initialized from:

```text
sql/init.sql
```

phpMyAdmin runs at:

```text
http://localhost:8080
```

## Run Locally

```bash
npm start
```

Open the app:

```text
http://localhost:3000
```

## Default Database Connection

The application connects to MySQL with:

```text
host: localhost
user: std
password: std
database: test
```

These values match the `docker-compose.yml` configuration.

## Team Modules

- Auth and setup: app setup, database connection, registration, login, email verification
- Market module: market profile and product management
- Consumer module: product search, cart management, and purchase flow
