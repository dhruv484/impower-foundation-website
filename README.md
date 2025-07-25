# Impower Foundation Website

A fully functional website for Impower Foundation with donation and registration capabilities.

## Features

### Frontend
- **Homepage** - Complete overview of foundation programs
- **Donation Page** - Secure donation form with amount selection
- **Registration Page** - Comprehensive volunteer registration form
- **Responsive Design** - Works on all devices
- **Modern UI** - Clean, professional design

### Backend
- **RESTful API** - Complete backend with Express.js
- **Database** - SQLite database for storing donations and registrations
- **Email Integration** - Automatic email confirmations
- **Form Validation** - Server-side validation
- **Admin Endpoints** - View all donations and registrations

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Email (Optional)
Edit `.env` file:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Start the Server
```bash
npm start
```

### 4. Access the Website
- **Homepage**: http://localhost:3000
- **Donation**: http://localhost:3000/donation.html
- **Registration**: http://localhost:3000/registration.html

## API Endpoints

### Donations
- `POST /api/donate` - Submit donation
- `GET /api/donations` - View all donations (admin)

### Registrations
- `POST /api/register` - Submit registration
- `GET /api/registrations` - View all registrations (admin)

### Health Check
- `GET /api/health` - Server status

## Database Schema

### Donations Table
- id (primary key)
- name
- email
- phone
- amount
- address
- anonymous
- newsletter
- created_at

### Registrations Table
- id (primary key)
- fullName
- email
- contact
- occupation
- age
- address
- city
- state
- interests
- availability
- experience
- motivation
- comments
- newsletter
- emergency
- created_at

## Email Setup

To enable email notifications:

1. Create a Gmail account or use existing
2. Enable 2-factor authentication
3. Generate an app password
4. Update `.env` file with your credentials

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Email**: Nodemailer
- **Styling**: Inter font, modern CSS

## Development

```bash
# Start development server
npm run dev

# View database
sqlite3 impower.db
```

## Production Deployment

1. Set up environment variables
2. Configure email settings
3. Use a process manager like PM2
4. Set up reverse proxy with Nginx
