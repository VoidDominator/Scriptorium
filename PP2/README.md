# Scriptorium Backend API

Scriptorium is a backend API project built using Next.js, Prisma, and JWT-based authentication. The goal is to provide a platform where users can write, save, execute, and share code templates, interact with blog posts, and report inappropriate content.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running the Development Server](#running-the-development-server)
- [API Endpoints](#api-endpoints)
  - [Authentication and User Management](#authentication-and-user-management)
  - [Code Execution](#code-execution)
  - [Blog Post and Blog Comment](#blog-post-and-blog-comment)
  - [Blog Report and Admin Manipulation](#blog-report-and-admin-manipulation)
- [Project Structure](#project-structure)
- [Additional Notes](#additional-notes)
- [License](#license)

## Features

- **User Authentication**: Register, login, and logout with JWT-based authentication.
- **Role-Based Access Control**: Admin and regular user roles with permissions.
- **Code Writing and Execution**: Supports code writing and execution in C, C++, Java, Python, and JavaScript.
- **Content Reporting**: Users can report inappropriate blog posts or comments, managed by admins.
- **Protected Routes**: Access to certain routes is restricted based on authentication and role.
- **Pagination**: Long lists of items (e.g., templates, blogs, comments) are paginated to ensure reasonable data is returned per response.

## Tech Stack

- **Next.js**: Server-side rendering and API routes.
- **Prisma**: ORM for database management.
- **SQLite**: Development database (can be adjusted for production).
- **JWT**: JSON Web Tokens for authentication.
- **Supertest**: Testing framework for API endpoints.

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Compilers/Interpreters** for supported languages (C, C++, Java, Python, JavaScript)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://markus.teach.cs.toronto.edu/git/markus/csc309-2024-09/group_7329
   cd PP1
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Prisma**:
   ```bash
    npx prisma init
    npx prisma generate
    npx prisma migrate dev
    npx prisma studio // displayed on localhost:5555
    ```

### Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
DATABASE_URL="file:./dev.db"  # Adjust for production
JWT_ACCESS_SECRET="v4tT2b&n53JKl2^fg@M2sdf#3LKjlz67!"
JWT_REFRESH_SECRET="kL^3NdJ!d6sdf$DfS9l!kLZop98wJ!3J"
ADMINPASSWORD = "adminpassword"
```
Ensure the secrets are secure and unique.

### Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

By default, the server runs on http://localhost:3000.

## API Endpoints

### Authentication and User Management

- **POST /api/users/register**: Register a new user with role assignment (admin or user).
- **POST /api/users/login**: Login to get an access token and a refresh token.
- **POST /api/users/refresh**: Refresh access tokens using a valid refresh token.
- **POST /api/users/profile**: Make updates on the user profile (authenticated users only).
- **POST /api/users/changepassword**: change password if provide the correct old one (authenticated users only).

### Code Execution

- **POST /api/execute**: To execute the code sent to backend server.
- **GET /api/templates**: Retrieve a template for viewing as visitors.
- **POST /api/template**: Create a template (authenticated users only).
- **GET /api/template/:id**: To view the template (authenticated users only).
- **PUT /api/template/:id**: To update on the template by its ID (authenticated users only).
- **DELETE /api/template/:id**: To delete the template by its ID (authenticated users only).
- **POST /api/template/fork**: To use an existing code and fork it (authenticated users only).

### Blog Post and Blog Comment
#### Blog Post
- **GET /api/blog-post**: Retrieve a paginated list of blog posts for visitors to read.
- **POST /api/blog-post**: Create a new blog post (authenticated users only).
- **PUT /api/blog-post/:id**: Edit a blog post by its ID (authenticated users only).
- **DELETE /api/blog-post/:id**: Delete a blog post by ID (authenticated users only).
- **GET /api/blog-post/search**: Do the searching and sorting based on different requirements.
- **POST /api/blog-post/:id/templates**: To link a list of templates into a blog post (authenticated users only).
- **GET /api/blog-post/searchmine**: Search a specific user's blog posts, even hidden (authenticated users only).

#### Blog Comment
- **GET /api/blog-comment**: Retrieve the blog comment for visitors to read.
- **POST /api/blog-comment**: Comment on a specific blog post (authenticated users only).
- **PUT /api/blog-comment/:id**: Edit a blog comment bt its ID (authenticated users only).
- **DELETE /api/blog-comment/:id**: Delete a blog comment by its ID (authenticated users only).

#### Vote
- **POST /api/votes/vote**: To vote up or down for a post or comment (authenticated users only).
- **GET /api/votes/:id**: To retrieve the data to see if user has voted before (authenticated users only).

### Blog Report and Admin Manipulation

- **POST /api/report**: Submit a report on a blog post or comment.
- **GET /api/admin/reports**: List all reported content, accessible only to admins.
- **PATCH /api/admin/reports**: Update the visibility of reported content (hide/unhide) based on `postId` or `commentId`, accessible only to admins.

## Project Structure 

```plaintext
├── prisma/                   # Prisma schema and migrations
│   ├── schema.prisma
├── scripts
    ├── createAdmin.js        # Create and insert an administrator into db
├── src/
│   ├── pages/
│   │   └── api/              # API routes
│   │       ├── users/        # User-related endpoints (register, login, refresh)
│   │       ├── admin/        # Admin-only routes for reports
│   │       ├── execute/      # Routes for code execution 
│   │       ├── template/     # Routes for code templates
│   │       ├── blog-post/    # Blog-post endpoints
│   │       ├── blog-comment/ # Blog-comment endpoints
│   │       ├── votes/        # Upvote or downvote
│   │       └── report.js     # Route for submitting content reports
│   ├── utils/
│   │   ├── db.js             # Prisma client instance
│   │   ├── auth.js           # Helper functions for authorization && authentication
│   │   ├── executeLocal.js   # To actually execute the code
│   │   └── middleware.js     # Middleware for JWT authentication
├── .env                      # Environment variables
├── startup.sh                # Script to set up environment
├── run.sh                    # Script to run server
├── README.md                 # Project documentation
├── docs.pdf                  # API endpoints documentation
├── postman.json              # The postman testing requests
└── package.json              # Project dependencies and scripts
```

## Additional Notes

- **Programming Languages**: In Part 1, the project supports code execution for C, C++, Java, Python, and JavaScript. Compilers/interpreters for these languages must be installed on your machine. In Part 2, more languages and isolation features will be added using Docker.
- **Code Execution**: Code execution occurs on the backend server, ensuring consistency and security. No third-party API is used for code execution.
- **Pagination**: Long lists of items (e.g., templates, blogs, comments) are paginated to ensure a reasonable amount of data is returned per response.
- **Profile Pictures**: Users may upload their own profile pictures.
- **Admin User Creation**: Use a `startup.sh` script to automatically create an admin user with default credentials specified in the documentation.
- **Postman Collection**: Include a Postman collection that automates token handling to simplify testing.

## License

This project is licensed under the MIT License.
```CSS
This `README.md` provides all necessary details for setting up, running, and understanding the project, following the requirements you provided. Let me know if you need further customization!
```