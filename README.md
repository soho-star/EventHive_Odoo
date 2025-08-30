# EventHive - Event Management Platform

<div align="center">

![EventHive Logo](EventHive.png)

**A Comprehensive Event Management Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%3E%3D18.0.0-blue)](https://reactjs.org/)

</div>

---

## 🎯 Project Overview

EventHive is a **full-stack event management platform** that bridges the gap between event organizers and attendees. It provides a seamless experience for creating, discovering, booking, and managing events with integrated local storage, automated notifications, and real-time analytics.

### 🎪 Core Value Proposition

- **For Organizers**: Streamlined event creation, ticket management, and attendee analytics
- **For Attendees**: Easy event discovery, secure booking, and convenient ticket delivery
- **For Venues**: QR-based check-in system with real-time validation

## ✨ Key Features

### 👥 For Attendees
- **Event Discovery** - Location-based search with advanced filters
- **Secure Booking** - Multi-step booking wizard with free events
- **Digital Tickets** - QR/Barcode tickets delivered via Email
- **Smart Reminders** - Automated notifications before events
- **User Dashboard** - Personal event history and ticket management

### 🎯 For Organizers
- **Event Management** - Create, edit, and publish events with rich media
- **Ticket Configuration** - Multiple ticket types with limits
- **Real-time Analytics** - Sales tracking, demographics, and revenue reports
- **Attendee Management** - Searchable attendee lists with export functionality
- **Check-in System** - QR code validation for secure entry

### 🔧 System Features
- **Local-first Architecture** with role-based access control
- **Real-time Updates** using modern React patterns
- **Local File Storage** for images and documents
- **Automated Email** notifications and reminders
- **QR Code Validation** system for secure check-ins
- **Comprehensive Logging** and error tracking

## 💻 Tech Stack

### 🎨 Frontend
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for beautiful, accessible UI components
- **Redux Toolkit** for state management
- **React Router v6** for client-side routing
- **React Query** for server state management
- **Formik & Yup** for form handling and validation

### ⚙️ Backend
- **Node.js** with Express.js framework
- **MySQL** database with connection pooling
- **JWT** authentication with bcrypt password hashing
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **Node-cron** for scheduled tasks

### 🔌 Local Services
- **Local File System** for image and document storage
- **Local SMTP** for email delivery
- **Scheduled Tasks** for reminders and notifications

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MySQL** (v8.0.0 or higher)
- **npm** or **yarn** package manager

### ⚡ Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/soho-star/EventHive_Odoo.git
   cd EventHive_Odoo
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Backend environment
   cd ../backend
   cp env.example .env
   # Edit .env with your MySQL credentials
   
   # Frontend environment
   cd ../frontend
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE eventhive;
   EXIT;
   
   # Run migrations
   cd ../backend
   npm run db:migrate
   
   # Seed sample data (optional)
   npm run db:seed
   ```

5. **Start Development Servers**
   ```bash
   # Start backend (Terminal 1)
   cd backend
   npm run dev
   
   # Start frontend (Terminal 2)
   cd ../frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
EventHive/
├── backend/
│   ├── src/
│   │   ├── config/           # Database and app configuration
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── migrations/       # Database migrations
│   │   ├── seeds/            # Sample data
│   │   └── server.js         # Main server file
│   ├── uploads/              # User uploaded files
│   ├── data/                 # Database files
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── EventHive.png     # Logo file
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store
│   │   ├── App.js            # Main app component
│   │   └── index.js          # Entry point
│   └── package.json
├── EventHive.png             # Project logo
├── CONTEXT.md                # Detailed documentation
└── README.md
```

## 🔐 Authentication & Authorization

### User Roles
- **User**: Basic event attendee
- **Organizer**: Can create and manage events
- **Admin**: Full system access

### Test Credentials
- **Email**: `admin@eventhive.com`
- **Password**: `admin123`

## 🗄️ Database Schema

The application uses a normalized MySQL database with the following main tables:
- **users** - User accounts and profiles
- **events** - Event information and details
- **tickets** - Ticket types and pricing
- **transactions** - Booking records
- **attendees** - Individual attendee information
- **promotions** - Discount codes and offers

## 📱 Features Implemented

### ✅ Completed
- [x] Complete database schema with migrations
- [x] React frontend with Material-UI
- [x] Redux state management
- [x] Authentication system structure
- [x] Responsive design with mobile support
- [x] Event discovery and browsing
- [x] User dashboard and profile management
- [x] Organizer event management interface
- [x] Admin panel structure
- [x] API service layer
- [x] Local file storage setup

### ✅ Completed Features
- [x] Complete backend API implementation with Express.js
- [x] JWT authentication with OTP verification system
- [x] Local file upload functionality with image processing
- [x] Email notification system with Nodemailer
- [x] QR code generation and validation for tickets
- [x] Comprehensive user management and role-based access
- [x] Event creation, management, and booking system
- [x] Real-time search and filtering
- [x] Responsive Material-UI design
- [x] Complete authentication flow (login, register, forgot password)
- [x] Profile management with image uploads
- [x] Event discovery and detailed event pages
- [x] Ticket booking with attendee management
- [x] Dashboard for users, organizers, and admins

## 🧪 Testing

### Quick Start Testing

```bash
# Run comprehensive application tests
node test-application.js

# Start backend server (Terminal 1)
cd backend
npm run dev

# Start frontend server (Terminal 2)
cd frontend
npm start

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
```

### Test Login Credentials
```
Email: admin@eventhive.com
Password: admin123
Role: Administrator
```

### API Endpoints Testing
```bash
# Health Check
curl http://localhost:5000/health

# Get Events
curl http://localhost:5000/api/events

# Login Test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventhive.com","password":"admin123"}'

# Get User Profile (requires token)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create Event (requires organizer/admin token)
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Test Event","description":"Test Description","category":"technology"}'
```

### Feature Testing Checklist
- [ ] User Registration and Email Verification
- [ ] User Login and JWT Authentication
- [ ] Password Reset Flow
- [ ] Profile Management with Image Upload
- [ ] Event Creation with Media Upload
- [ ] Event Discovery and Search
- [ ] Event Booking and Ticket Generation
- [ ] QR Code Generation for Tickets
- [ ] Role-based Access Control
- [ ] File Upload and Management
- [ ] Responsive Design on Mobile/Desktop

## 🔮 Future Roadmap

### Phase 2
- [ ] Advanced Analytics Dashboard
- [ ] Multi-language Support (i18n)
- [ ] Social Media Integration
- [ ] Advanced Promotion System
- [ ] Team Management Features

### Phase 3
- [ ] Mobile Applications (iOS & Android)
- [ ] AI-powered Recommendations
- [ ] Live Streaming Integration
- [ ] Blockchain Ticket Verification
- [ ] Advanced Reporting & Insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report Bugs](https://github.com/soho-star/EventHive_Odoo/issues)
- **Documentation**: See [CONTEXT.md](CONTEXT.md) for detailed technical documentation

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better event management solutions
- Designed with user experience and accessibility in mind

---

<div align="center">

**Built with ❤️ for the community**

[🌟 Star this repo](https://github.com/soho-star/EventHive_Odoo) | [🐛 Report Issues](https://github.com/soho-star/EventHive_Odoo/issues) | [📖 Documentation](CONTEXT.md)

</div>
