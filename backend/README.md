# IdeaVerse Backend

Backend API for the IdeaVerse innovation and freelance collaboration platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up MySQL database:
   - Install MySQL on your system or use MySQL Workbench
   - Create a database for the application

3. Create a `.env` file and add your database configuration:
```env
PORT=5000
JWT_SECRET=ideaverse_secret

# Database Configuration (Option 1: Individual variables)
DB_NAME=ideaverse
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

# OR use DATABASE_URL (Option 2: Connection string - common in production)
# DATABASE_URL=mysql://user:password@host:port/database
```

4. Run the server:
```bash
npm run dev
# or
npm start
```

## Tech Stack

- Express.js
- MySQL (Sequelize ORM)
- JWT Authentication
- bcryptjs for password hashing

## Database Migration

The application uses Sequelize ORM. Models are automatically synced in development mode. For production, consider using Sequelize migrations:

```bash
# Generate migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate
```

## API Endpoints

- `/api/auth` - Authentication routes (login, register, password reset)
- `/api/users` - User management routes
- `/api/ideas` - Idea creation and management
- `/api/jobs` - Job posting and applications
- `/api/chat` - Real-time chat functionality
- `/api/investor` - Investor discussion features
- `/api/admin` - Admin panel routes

## Seeding Database

To populate the database with sample data:

```bash
npm run seed
```

This will create:
- Sample users (admin, creators, freelancers, recruiters, investors)
- Sample ideas
- Sample jobs

Default login credentials will be displayed after seeding.

