# GreenStep Dashboard API Documentation

## Overview
The GreenStep Dashboard API provides comprehensive endpoints for managing tree planting and care tracking functionality. This API supports user authentication, tree management, care record tracking, growth measurements, and analytics.

## Base URL
```
http://localhost:8000/api/dashboard
```

## Authentication
All dashboard endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Or use cookies (automatically handled by the browser).

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Response**: 429 Too Many Requests when limit exceeded

## Error Responses
All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Endpoints

### Tree Management

#### Get All Trees
```http
GET /trees
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort field (createdAt, updatedAt, name, species, plantDate, healthStatus)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "trees": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTrees": 47,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Tree by ID
```http
GET /trees/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tree": {
      "_id": "tree_id",
      "name": "Oak Tree #1",
      "species": "Quercus robur",
      "location": "Backyard Garden",
      "plantDate": "2024-01-15T00:00:00.000Z",
      "height": 2.5,
      "diameter": 0.15,
      "healthStatus": "excellent",
      "carbonAbsorbed": 12.5,
      "userId": "user_id"
    },
    "recentCareRecords": [...],
    "recentGrowthMeasurements": [...],
    "upcomingReminders": [...]
  }
}
```

#### Add New Tree
```http
POST /trees
```

**Request Body:**
```json
{
  "name": "Oak Tree #1",
  "species": "Quercus robur",
  "location": "Backyard Garden",
  "plantDate": "2024-01-15",
  "height": 1.5,
  "diameter": 0.1,
  "notes": "Planted in partial shade",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

#### Update Tree
```http
PUT /trees/:id
```

**Request Body:** Same as Add New Tree (all fields optional)

#### Delete Tree
```http
DELETE /trees/:id
```

**Note:** Performs soft delete (sets isActive to false)

### Care Records

#### Get Care Records
```http
GET /care-records
```

**Query Parameters:**
- `treeId` (optional): Filter by tree ID
- `action` (optional): Filter by action type
- `page`, `limit`, `sortBy`, `sortOrder`: Pagination parameters

#### Add Care Record
```http
POST /care-records
```

**Request Body:**
```json
{
  "treeId": "tree_id",
  "action": "watering",
  "notes": "Deep watering session",
  "healthRating": 5,
  "duration": 30,
  "weather": {
    "temperature": 22,
    "humidity": 65,
    "conditions": "sunny"
  },
  "materials": [
    {
      "name": "Water",
      "quantity": 10,
      "unit": "L"
    }
  ]
}
```

### Growth Measurements

#### Get Growth Measurements for Tree
```http
GET /trees/:treeId/growth-measurements
```

#### Add Growth Measurement
```http
POST /growth-measurements
```

**Request Body:**
```json
{
  "treeId": "tree_id",
  "height": 2.5,
  "diameter": 0.15,
  "canopySpread": 1.8,
  "notes": "Monthly measurement",
  "measuredBy": "user",
  "measurementMethod": "tape",
  "accuracy": 95,
  "weather": {
    "temperature": 18,
    "humidity": 70,
    "conditions": "cloudy"
  }
}
```

### Care Reminders

#### Get Care Reminders
```http
GET /care-reminders
```

**Query Parameters:**
- `type` (optional): Filter by reminder type
- `isCompleted` (optional): Filter by completion status
- `overdue` (optional): Get only overdue reminders (true/false)

#### Mark Reminder as Completed
```http
PATCH /care-reminders/:id/complete
```

### Analytics

#### Get Dashboard Statistics
```http
GET /stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTrees": 15,
    "totalCarbonAbsorbed": 234.5,
    "averageHealth": 3.2,
    "totalCareRecords": 89,
    "treesPlantedThisMonth": 3,
    "communityTotalTrees": 225,
    "communityTotalCarbon": 3517.5,
    "overdueReminders": 2,
    "upcomingReminders": 5
  }
}
```

#### Get Analytics Report
```http
GET /analytics/report
```

**Query Parameters:**
- `period` (optional): Report period (3months, 6months, 1year)

#### Get Growth Trend Data
```http
GET /analytics/growth-trend
```

**Query Parameters:**
- `months` (optional): Number of months to include (1-24)

#### Get Community Analytics
```http
GET /analytics/community
```

## Data Models

### Tree
```typescript
interface Tree {
  _id: string;
  userId: string;
  name: string;
  species: string;
  location: string;
  plantDate: Date;
  height: number;
  diameter: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  lastWatered: Date;
  lastFertilized: Date;
  notes: string;
  carbonAbsorbed: number;
  imageUrl?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Care Record
```typescript
interface CareRecord {
  _id: string;
  treeId: string;
  userId: string;
  date: Date;
  action: 'watering' | 'fertilizing' | 'pruning' | 'pest_control' | 'other';
  notes: string;
  healthRating: number; // 1-5
  images?: string[];
  weather?: {
    temperature: number;
    humidity: number;
    precipitation: number;
    conditions: string;
  };
  duration?: number; // minutes
  materials?: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}
```

### Growth Measurement
```typescript
interface GrowthMeasurement {
  _id: string;
  treeId: string;
  userId: string;
  date: Date;
  height: number;
  diameter: number;
  canopySpread?: number;
  trunkCircumference?: number;
  notes?: string;
  images?: string[];
  measuredBy: 'user' | 'expert' | 'automated';
  measurementMethod: 'manual' | 'laser' | 'tape' | 'app' | 'other';
  accuracy: number; // percentage
  weather?: {
    temperature: number;
    humidity: number;
    conditions: string;
  };
}
```

### Care Reminder
```typescript
interface CareReminder {
  _id: string;
  treeId: string;
  userId: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'health_check';
  dueDate: Date;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'custom';
  customFrequency?: {
    days: number;
    weeks: number;
    months: number;
  };
  isRecurring: boolean;
  reminderSent: boolean;
}
```

## Validation Rules

### Tree Validation
- `name`: Required, 2-100 characters
- `species`: Required, 2-100 characters
- `location`: Required, 2-200 characters
- `height`: Required, 0-100 meters
- `diameter`: Required, 0-5 meters
- `healthStatus`: Optional, must be one of: excellent, good, fair, poor
- `coordinates.latitude`: Optional, -90 to 90
- `coordinates.longitude`: Optional, -180 to 180

### Care Record Validation
- `treeId`: Required, valid MongoDB ObjectId
- `action`: Required, must be one of: watering, fertilizing, pruning, pest_control, other
- `healthRating`: Optional, 1-5 integer
- `duration`: Optional, 0-1440 minutes
- `weather.temperature`: Optional, -50 to 60 degrees
- `weather.humidity`: Optional, 0-100 percent

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Examples

### Complete Tree Management Flow

1. **Add a new tree:**
```bash
curl -X POST http://localhost:8000/api/dashboard/trees \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Oak Tree",
    "species": "Quercus robur",
    "location": "Garden",
    "height": 1.5,
    "diameter": 0.1
  }'
```

2. **Record care activity:**
```bash
curl -X POST http://localhost:8000/api/dashboard/care-records \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "treeId": "tree_id_here",
    "action": "watering",
    "notes": "Weekly watering",
    "healthRating": 5
  }'
```

3. **Get dashboard stats:**
```bash
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer your-jwt-token"
```

## Environment Variables

Make sure to set these environment variables:

```env
JWT_SECRET=your-secret-key
MONGO_URL=mongodb://localhost:27017/greenstep
FRONTEND_URL=http://localhost:8081
NODE_ENV=development
```
