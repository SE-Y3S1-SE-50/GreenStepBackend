# GreenStep Backend API

A comprehensive backend API for the GreenStep tree planting and care tracking application.

## Features

- 🌱 **Tree Management**: Register, track, and manage planted trees
- 📊 **Analytics Dashboard**: Comprehensive analytics and reporting
- 💧 **Care Tracking**: Log watering, fertilizing, pruning, and health checks
- 📏 **Growth Monitoring**: Track tree growth measurements over time
- 🔔 **Care Reminders**: Automated reminders for tree care activities
- 👥 **User Management**: Authentication and user profiles
- 📈 **Community Analytics**: Aggregate community impact data

## Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Express Validator** for input validation
- **Moment.js** for date handling
- **Lodash** for utility functions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GreenStepBackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   MONGO_URL=mongodb://localhost:27017/greenstep
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=8000
   FRONTEND_URL=http://localhost:8081
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed sample data (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:8000`

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /check-cookie` - Verify authentication cookie

### Dashboard Endpoints
- `GET /dashboard/trees` - Get user's trees
- `POST /dashboard/trees` - Add new tree
- `GET /dashboard/trees/:id` - Get specific tree
- `PUT /dashboard/trees/:id` - Update tree
- `DELETE /dashboard/trees/:id` - Delete tree

### Care Management
- `GET /dashboard/care-records` - Get care records
- `POST /dashboard/care-records` - Add care record
- `GET /dashboard/care-reminders` - Get care reminders
- `PATCH /dashboard/care-reminders/:id/complete` - Mark reminder complete

### Analytics
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/analytics/report` - Get comprehensive analytics report
- `GET /dashboard/analytics/growth-trend` - Get growth trend data
- `GET /dashboard/analytics/community` - Get community analytics

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Database Models

### Tree
- User ownership and basic information
- Growth tracking (height, diameter)
- Health status monitoring
- Carbon absorption calculations
- Location coordinates (optional)

### Care Record
- Care activity logging (watering, fertilizing, etc.)
- Health ratings and notes
- Weather conditions
- Material usage tracking

### Growth Measurement
- Height and diameter measurements
- Measurement metadata (method, accuracy)
- Weather conditions during measurement
- Historical growth tracking

### Care Reminder
- Automated care reminders
- Recurring reminder scheduling
- Priority and completion tracking
- Custom frequency settings

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP address
- **Response**: 429 status code when limit exceeded

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Validation

Input validation is handled using Express Validator with comprehensive rules for:
- Tree data (name, species, location, measurements)
- Care records (action type, health ratings, weather data)
- Growth measurements (height, diameter, measurement metadata)
- User authentication data

## Sample Data

The seed script creates realistic sample data including:
- 2 sample users (johndoe/janesmith with password "password123")
- 5 trees with different species and health statuses
- 30 care records with various activities
- Growth measurements over time
- Care reminders for different activities

## Development

### Project Structure
```
src/
├── controllers/     # Request handlers
├── middleware/      # Authentication, validation, etc.
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
└── scripts/        # Utility scripts
```

### Running Tests
```bash
npm test
```

### Code Style
- ESLint for code linting
- Consistent error handling
- Comprehensive input validation
- Detailed API documentation

## Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use production MongoDB instance
   - Configure secure JWT secret
   - Set up proper CORS origins

2. **Security Considerations**
   - Use HTTPS in production
   - Implement proper rate limiting
   - Validate all input data
   - Use environment variables for secrets

3. **Performance Optimization**
   - Enable MongoDB indexing
   - Implement caching for analytics
   - Use connection pooling
   - Monitor API performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team or create an issue in the repository.