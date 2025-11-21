# IdeaVerse Setup Guide

Complete setup instructions to get IdeaVerse running on your local machine.

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v5.7+ or v8.0+) - [Download](https://dev.mysql.com/downloads/mysql/)
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional, for cloning)

## Step 1: Install Dependencies

### Root Dependencies
```bash
npm install
```

### Backend Dependencies
```bash
cd backend
npm install
```

### Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Step 2: Database Setup

### Option A: Using MySQL Command Line

1. Open MySQL command line or terminal
2. Login to MySQL:
   ```bash
   mysql -u root -p
   ```
3. Create the database:
   ```sql
   CREATE DATABASE ideaverse;
   ```
4. Verify the database was created:
   ```sql
   SHOW DATABASES;
   ```
5. Exit MySQL:
   ```sql
   EXIT;
   ```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Create a new connection:
   - Connection Name: `IdeaVerse`
   - Hostname: `localhost`
   - Port: `3306`
   - Username: `root` (or your MySQL username)
   - Password: Your MySQL password
3. Click "Test Connection" to verify
4. Connect and run:
   ```sql
   CREATE DATABASE ideaverse;
   ```

## Step 3: Environment Configuration

### Create `.env` file in `backend/` directory

Create a new file `backend/.env` with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=ideaverse_secret_change_this_in_production

# Database Configuration
DB_NAME=ideaverse
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

# Frontend URL (for email links and CORS)
FRONTEND_URL=http://localhost:5173

# Optional: Email Service Configuration
# Uncomment and configure if you want email verification and password reset emails

# Email Provider (smtp, gmail, sendgrid, mailgun)
# EMAIL_PROVIDER=smtp

# Gmail SMTP Configuration Example:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_gmail_app_password
# EMAIL_FROM=noreply@ideaverse.com
# EMAIL_FROM_NAME=IdeaVerse

# For Gmail, you need to:
# 1. Enable 2-factor authentication
# 2. Generate an "App Password" from Google Account settings
# 3. Use that app password as SMTP_PASS

# Optional: Tech News API (for tech news feature)
# Get free API key from https://newsapi.org
# NEWS_API_KEY=your_news_api_key_here
```

### Important Notes:

1. **JWT_SECRET**: Generate a strong random string for production. You can use:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **DB_PASSWORD**: Replace with your actual MySQL root password

3. **Email Service**: Email service is optional. The app will work without it, but:
   - Email verification won't send (registration still works)
   - Password reset emails won't send
   - Users can still verify emails manually via `/verify-email` route if needed

## Step 4: Run Database Seeder (Optional)

Populate the database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- Sample users (admin, creators, freelancers, recruiters, investors)
- Sample ideas
- Sample jobs

**Default admin credentials** (if seeded):
- Email: `admin@ideaverse.com`
- Password: `admin123`

⚠️ **Change admin password immediately after first login!**

## Step 5: Start the Application

### Option 1: Run Both Servers Together (Recommended)

From the **root directory**:
```bash
npm start
```

This will start:
- Backend API server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173`

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 6: Access the Application

1. Open your browser and go to: `http://localhost:5173`
2. You should see the IdeaVerse home page
3. Register a new account or use seeded credentials to login

## Troubleshooting

### Database Connection Error

**Problem**: `❌ Database connection error: ...`

**Solutions**:
1. Make sure MySQL is running:
   ```bash
   # Windows (if installed as service)
   # Check Services app

   # macOS
   brew services start mysql

   # Linux
   sudo systemctl start mysql
   ```

2. Verify database exists:
   ```sql
   SHOW DATABASES;
   ```

3. Check `.env` file has correct credentials

4. Test connection manually:
   ```bash
   mysql -u root -p -e "USE ideaverse;"
   ```

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
1. Change PORT in `.env` file
2. Or kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### Module Not Found Errors

**Problem**: `Cannot find module '...'`

**Solution**: 
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

**Problem**: CORS policy blocking requests

**Solution**: Make sure `FRONTEND_URL` in `.env` matches your frontend URL

### Email Service Not Working

**Problem**: Email verification/password reset emails not sending

**Solutions**:
1. Email service is optional - the app works without it
2. Check `.env` email configuration is correct
3. For Gmail, make sure you're using an App Password, not regular password
4. Check email service logs in backend console

## Production Deployment

### Environment Variables for Production

1. **JWT_SECRET**: Use a strong, randomly generated secret
2. **NODE_ENV**: Set to `production`
3. **Database**: Use a managed database service (AWS RDS, PlanetScale, etc.)
4. **CORS**: Update `CORS_ORIGINS` to include your production domain
5. **Email**: Configure a production email service (SendGrid, Mailgun, AWS SES)

### Build Frontend for Production

```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/` directory.

## Need Help?

- Check the main [README.md](./README.md) for more information
- Review backend logs in `backend/logs/`
- Check browser console for frontend errors

