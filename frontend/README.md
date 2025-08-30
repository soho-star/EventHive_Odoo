# EventHive Frontend

A modern React frontend for the EventHive event management platform.

## 🚀 Features

- **Modern UI/UX**: Built with React 18 and Tailwind CSS
- **Responsive Design**: Mobile-first approach with beautiful responsive layouts
- **Authentication**: Complete auth flow with login, register, OTP verification
- **Event Management**: Browse, search, and view event details
- **User Dashboard**: Personal dashboard with bookings and profile management
- **Organizer Tools**: Event creation and management for organizers
- **Admin Panel**: Administrative interface for system management
- **State Management**: Redux Toolkit for predictable state management
- **API Integration**: React Query for efficient data fetching and caching
- **Form Handling**: React Hook Form for robust form validation
- **Notifications**: React Hot Toast for user feedback

## 🛠️ Tech Stack

- **React 18** - UI Library
- **React Router DOM** - Client-side routing
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful SVG icons
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file (optional)
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components (Header, Footer, etc.)
│   └── UI/             # UI components (Button, Input, Card, etc.)
├── pages/              # Page components
│   ├── Auth/           # Authentication pages
│   ├── Dashboard/      # User dashboard pages
│   ├── Organizer/      # Organizer pages
│   └── Admin/          # Admin pages
├── services/           # API service functions
├── store/              # Redux store and slices
│   └── slices/         # Redux slices
├── App.js              # Main app component
├── index.js            # Entry point
└── index.css           # Global styles
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Secondary**: Gray (#64748b)
- **Success**: Green (#22c55e)
- **Danger**: Red (#ef4444)
- **Warning**: Yellow (#f59e0b)

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Clean card components with header, content, and footer
- **Forms**: Consistent form styling with validation
- **Navigation**: Responsive navigation with mobile support

## 🔄 State Management

### Redux Store Structure
```javascript
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    // ...
  },
  ui: {
    sidebarOpen: false,
    theme: 'light',
    notifications: [],
    // ...
  }
}
```

### React Query
- **Caching**: Automatic caching of API responses
- **Background Updates**: Keep data fresh in the background
- **Error Handling**: Centralized error handling
- **Loading States**: Automatic loading state management

## 🛡️ Authentication

The app includes a complete authentication system:

1. **Registration**: Multi-step registration with OTP verification
2. **Login**: Secure login with JWT tokens
3. **Protected Routes**: Role-based route protection
4. **Password Reset**: Forgot password functionality
5. **Profile Management**: User profile updates

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch Friendly**: Optimized for touch interactions

## 🎯 User Roles

### Regular User
- Browse and search events
- Book events and manage bookings
- View personal dashboard
- Update profile

### Organizer
- All user features
- Create and manage events
- View event analytics
- Manage attendees

### Admin
- All organizer features
- User management
- System-wide event management
- System statistics and analytics

## 🔌 API Integration

All API calls are handled through service functions:

```javascript
// Example API service
const eventService = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  // ...
};
```

## 🚀 Build and Deployment

### Development
```bash
npm start          # Start development server
npm test           # Run tests
```

### Production
```bash
npm run build      # Create production build
npm run serve      # Serve production build locally
```

## 🎨 Customization

### Tailwind Configuration
Customize the design system by modifying `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Custom primary colors
        }
      }
    }
  }
}
```

### Component Styling
Components use Tailwind utility classes with custom CSS classes defined in `index.css`.

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript-style JSDoc comments
3. Ensure responsive design
4. Add proper error handling
5. Test on multiple devices

## 📄 License

This project is part of the EventHive platform. See the main project LICENSE file for details.

