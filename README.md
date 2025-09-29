# Equipment Management System

This is a [Next.js](https://nextjs.org) project for managing equipment borrowing with Firebase authentication and PostgreSQL database.

## Prerequisites

Before running this project, make sure you have:

- Node.js (version 16 or later)
- PostgreSQL database
- Firebase project with Authentication enabled

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd web
npm install
```

### 2. Database Setup

1. Install PostgreSQL on your machine
2. Create a new database (e.g., `ENKKU_Maker-space`)
3. Make sure PostgreSQL is running on port 5432

### 3. Environment Variables Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` file with your configuration:

**Firebase Configuration:**
- Go to Firebase Console > Project Settings > General
- Copy your web app configuration values

**Database Configuration:**
- Replace the DATABASE_URL with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/your_database_name"
```

**Firebase Admin SDK (for server-side operations):**
- Go to Firebase Console > Project Settings > Service Accounts
- Generate a new private key
- Copy the project ID, client email, and private key to your `.env` file

**Admin Configuration:**
- Set ADMIN_EMAILS with the email addresses that should have admin privileges

### 4. Database Migration

Run Prisma migrations to set up your database schema:

```bash
npx prisma generate
npx prisma db push
```

### 5. Seed Database (Optional)

If you want to populate the database with sample data:

```bash
npm run seed
```

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Authentication**: Firebase Authentication with role-based access
- **Equipment Management**: Add, edit, and manage equipment inventory
- **Borrowing System**: Request and approve equipment borrowing
- **Admin Dashboard**: Manage users, equipment, and borrowing requests
- **User Roles**: USER, ADMIN, MODERATOR permissions

## API Routes

- `/api/user` - User management
- `/api/equipment` - Equipment operations
- `/api/borrow` - Borrowing requests
- `/api/admin` - Admin operations

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
