# EventHive Admin Interface Documentation

## Overview

The EventHive admin interface provides comprehensive management capabilities for system administrators to manage users, events, and view system statistics.

## Features

### 🔐 Admin Authentication
- **Admin Login**: Dedicated admin login page at `/admin/login`
- **Role-based Access**: Only users with `admin` role can access admin features
- **Secure Authentication**: JWT-based authentication with role verification

### 📊 Admin Dashboard
- **System Overview**: Real-time statistics and metrics
- **Recent Activities**: Latest users, events, and bookings
- **Quick Actions**: Direct access to common administrative tasks
- **Visual Analytics**: Color-coded statistics cards with trending indicators

### 👥 User Management
- **User List**: Comprehensive table view of all system users
- **Search & Filter**: Search by name/email, filter by role
- **User Actions**:
  - Edit user details (username, phone, role, verification status)
  - Promote users to organizer role
  - Verify/unverify user accounts
  - Delete users (with confirmation)
- **Pagination**: Efficient navigation through large user lists

### 🎫 Event Management
- **Event Grid**: Visual card-based layout for all events
- **Advanced Filtering**: Filter by category and publication status
- **Event Actions**:
  - View event details
  - Edit events (redirects to organizer interface)
  - Delete events (with confirmation)
- **Status Tracking**: Published, draft, and cancelled event status

### 📈 Statistics & Analytics
- **Key Metrics**: Total users, events, bookings, and revenue
- **Detailed Breakdowns**:
  - User statistics (verified, unverified, roles)
  - Event statistics (published, drafts, categories)
  - Booking statistics (status, revenue, performance)
- **Performance Metrics**: Conversion rates, averages, success rates

## Access & Setup

### Creating an Admin User

1. **Run the admin creation script**:
   ```bash
   cd backend
   npm run create-admin
   ```

2. **Default Admin Credentials**:
   - Email: `admin@eventhive.com`
   - Password: `admin123`

### Accessing the Admin Interface

1. **Navigate to admin login**: `/admin/login`
2. **Enter admin credentials**
3. **Access admin dashboard**: `/admin`

## Admin Routes

### Frontend Routes
- `/admin/login` - Admin login page
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/events` - Event management
- `/admin/stats` - Statistics and analytics

### Backend API Routes
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PATCH /api/admin/users/:id/promote` - Promote user to organizer
- `PATCH /api/admin/users/:id/verify` - Verify/unverify user
- `GET /api/admin/events` - Get all events
- `DELETE /api/admin/events/:id` - Delete event
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/overview` - Get system overview

## User Management Features

### User Roles
- **User**: Regular event attendees
- **Organizer**: Event creators and managers
- **Admin**: System administrators

### User Actions
1. **Edit User**:
   - Update username, phone number
   - Change user role
   - Toggle verification status

2. **Promote User**:
   - Promote regular users to organizer role
   - Enables event creation capabilities

3. **Verify User**:
   - Mark user accounts as verified
   - Improves user trust and access

4. **Delete User**:
   - Permanently remove user accounts
   - Includes confirmation dialog

## Event Management Features

### Event Status
- **Published**: Publicly visible events
- **Draft**: Unpublished events
- **Cancelled**: Cancelled events

### Event Actions
1. **View Event**: Open event details in new tab
2. **Edit Event**: Redirect to organizer edit interface
3. **Delete Event**: Permanently remove events

### Event Filtering
- **Category Filter**: Music, Sports, Technology, Business, Education, Entertainment
- **Status Filter**: Published, Draft, All
- **Search**: Search by title or description

## Statistics & Analytics

### Key Metrics
- **Total Users**: Complete user count with monthly growth
- **Total Events**: All events with published count
- **Total Bookings**: All bookings with confirmed count
- **Total Revenue**: System revenue with monthly tracking

### Detailed Analytics
- **User Analytics**: Role distribution, verification status, growth trends
- **Event Analytics**: Category distribution, status breakdown, pricing analysis
- **Booking Analytics**: Status distribution, revenue tracking, performance metrics

### Performance Metrics
- **Conversion Rate**: User to booking conversion
- **Average Events per User**: Event creation metrics
- **Average Bookings per Event**: Event popularity metrics
- **Success Rate**: Confirmed booking percentage

## Security Features

### Authentication
- JWT token-based authentication
- Role-based access control
- Secure password hashing

### Authorization
- Admin-only route protection
- Middleware-based role verification
- Session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## UI/UX Features

### Design System
- **Dark Theme**: Professional dark interface
- **Responsive Design**: Mobile-friendly layout
- **Modern UI**: Clean, intuitive interface
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: User feedback system

### Navigation
- **Sidebar Navigation**: Easy access to all admin features
- **Breadcrumb Navigation**: Clear page hierarchy
- **Quick Actions**: Common tasks readily available

### Data Presentation
- **Card Layout**: Visual event and user cards
- **Table Views**: Detailed data tables
- **Status Badges**: Color-coded status indicators
- **Pagination**: Efficient data navigation

## Error Handling

### User Feedback
- **Success Messages**: Confirmation of successful actions
- **Error Messages**: Clear error descriptions
- **Loading States**: Visual feedback during operations
- **Validation Errors**: Form validation feedback

### Error Recovery
- **Graceful Degradation**: System continues working on errors
- **Retry Mechanisms**: Automatic retry for failed operations
- **Fallback UI**: Alternative displays when data is unavailable

## Best Practices

### Data Management
- **Confirmation Dialogs**: Prevent accidental deletions
- **Batch Operations**: Efficient bulk actions
- **Data Export**: Export capabilities for reporting
- **Audit Trail**: Track administrative actions

### Performance
- **Pagination**: Handle large datasets efficiently
- **Caching**: Optimize data loading
- **Lazy Loading**: Load data on demand
- **Optimistic Updates**: Immediate UI feedback

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: High contrast for readability
- **Focus Management**: Proper focus indicators

## Troubleshooting

### Common Issues

1. **Admin Access Denied**:
   - Verify user has admin role
   - Check JWT token validity
   - Ensure proper authentication

2. **Data Not Loading**:
   - Check API connectivity
   - Verify database connection
   - Review server logs

3. **Actions Not Working**:
   - Check user permissions
   - Verify form validation
   - Review browser console for errors

### Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

## Future Enhancements

### Planned Features
- **Advanced Analytics**: Charts and graphs
- **Bulk Operations**: Mass user/event management
- **Audit Logs**: Detailed action tracking
- **Export Features**: Data export capabilities
- **Notification System**: Admin notifications
- **Backup Management**: System backup tools

### Integration Possibilities
- **Email Marketing**: User communication tools
- **Payment Analytics**: Detailed payment tracking
- **Social Media Integration**: Social media management
- **API Management**: Third-party integrations
