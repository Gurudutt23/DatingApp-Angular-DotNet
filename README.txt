DatingApp-Angular-DotNet

A full-stack dating application built from scratch using Angular and ASP.NET Core Web API.
This project focuses on real-world application architecture, authentication, profile
management, and secure backend development.

--------------------------------------------------

TECH STACK

Frontend:
- Angular (Standalone Components)
- TypeScript
- Tailwind CSS
- HTML5 / CSS3

Backend:
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT Authentication

--------------------------------------------------

KEY FEATURES

- User Registration and Login
- JWT-based Authentication and Authorization
- Secure Password Hashing (ASP.NET Identity PasswordHasher)
- Profile Creation and Edit
- Image Upload with Instant Preview
- Main Profile Photo Selection
- Gallery Management (Add / Delete / Set Main Photo)
- First-time Profile Creation Flow
- RESTful API Architecture

--------------------------------------------------

LEARNING OBJECTIVES

This project was built to understand and implement:
- Full-stack communication between Angular and .NET
- Authentication flow using JWT
- Secure password storage using hashing and salting
- Entity Framework Core relationships
- File upload handling in ASP.NET Core
- Angular strict template type safety
- Real-world project structuring

--------------------------------------------------

PROJECT STRUCTURE

DatingApp-Angular-DotNet
|
|-- API
|   |-- Controllers
|   |-- Entities
|   |-- DTOs
|   |-- Services
|   |-- Data
|
|-- client
|   |-- src/app
|   |-- components
|   |-- services
|
|-- README.txt

--------------------------------------------------

SETUP INSTRUCTIONS

Backend:
1. Navigate to the API folder
2. Update appsettings.json with your SQL Server connection string
3. Run database migrations:
   dotnet ef database update
4. Start the backend:
   dotnet run

Frontend:
1. Navigate to the client folder
2. Install dependencies:
   npm install
3. Run Angular application:
   ng serve
4. Open browser at:
   http://localhost:4200

--------------------------------------------------

SECURITY NOTES

- Passwords are never stored in plain text
- Passwords are hashed and salted using PasswordHasher
- JWT tokens are used for secure API access
- Sensitive data is never exposed to the client

--------------------------------------------------

PROJECT STATUS

In Active Development

Planned Improvements:
- Route Guards
- Profile Completion Validation
- Image Upload Progress Bar
- Forgot / Change Password
- Cloud Deployment (Azure / AWS)

--------------------------------------------------

AUTHOR

Gurudutt Sahu
Full Stack Developer (Angular | .NET)

GitHub:
https://github.com/Gurudutt23

--------------------------------------------------

If you like this project, feel free to explore the code and give it a star on GitHub.
