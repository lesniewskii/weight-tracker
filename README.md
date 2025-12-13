# Weight Tracker

A full-stack web application for tracking weight measurements, built with FastAPI (backend) and React (frontend), using PostgreSQL as the database.

## Features

- User registration and authentication
- Add, view, edit, and delete weight measurements
- Set and manage weight goals with visual progress tracking
- Interactive weight trend charts with goal reference lines
- Weight change analysis showing progress between measurements
- View detailed weight statistics and BMI calculations
- Export/import weight data as CSV
- Responsive web interface

## Tech Stack

- **Backend**: FastAPI, PostgreSQL, asyncpg, JWT authentication
- **Frontend**: React, Material-UI, Axios
- **Database**: PostgreSQL
- **Deployment**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed

### Running the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd weight-tracker
   ```

2. Start the application:
   ```bash
   docker compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

### Default User

A demo user is created automatically:
- Username: `johndoe`
- Password: `password`
- Email: `john@example.com`

## API Documentation

The backend provides a REST API with the following endpoints:

### Authentication

#### Register a new user
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "securepassword",
    "email": "user@example.com",
    "height": 175,
    "age": 30
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password"
  }'
```

Response includes an `access_token` for authenticated requests.

### Measurements

All measurement endpoints require authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

#### Get measurements
```bash
curl -X GET http://localhost:8000/measurements \
  -H "Authorization: Bearer <token>"
```

#### Add a measurement
```bash
curl -X POST http://localhost:8000/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "measurement_date": "2024-12-13",
    "weight": 70.5,
    "notes": "Morning weight"
  }'
```

#### Update a measurement
```bash
curl -X PUT http://localhost:8000/measurements/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "measurement_date": "2024-12-13",
    "weight": 71.0,
    "notes": "Updated weight"
  }'
```

#### Delete a measurement
```bash
curl -X DELETE http://localhost:8000/measurements/1 \
  -H "Authorization: Bearer <token>"
```

#### Get trends
```bash
curl -X GET http://localhost:8000/trends \
  -H "Authorization: Bearer <token>"
```

#### Export measurements as CSV
```bash
curl -X GET http://localhost:8000/export \
  -H "Authorization: Bearer <token>" \
  -o measurements.csv
```

#### Import measurements from CSV
```bash
curl -X POST http://localhost:8000/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@measurements.csv"
```

### Goals

#### Get goals
```bash
curl -X GET http://localhost:8000/goals \
  -H "Authorization: Bearer <token>"
```

#### Create a goal
```bash
curl -X POST http://localhost:8000/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "target_weight": 75.0,
    "target_date": "2024-12-31",
    "start_weight": 70.5
  }'
```

## Development

### Backend

The backend is built with FastAPI and uses:
- JWT for authentication
- PostgreSQL with asyncpg
- Pydantic for data validation

### Frontend

The frontend is a React application using:
- Material-UI for components
- Axios for API calls
- Recharts for interactive data visualization (weight trends, goal tracking, change analysis)

### Database Schema

The application uses three main tables:
- `users`: User accounts
- `weight_measurements`: Weight tracking data
- `goals`: Weight loss/gain goals

## Environment Variables

### Backend
- `DB_HOST`: Database host (default: db)
- `DB_NAME`: Database name (default: weight_tracker)
- `DB_USER`: Database user (default: myuser)
- `DB_PASSWORD`: Database password (default: mypassword)
- `DB_PORT`: Database port (default: 5432)
- `SECRET_KEY`: JWT secret key
- `CORS_ALLOW_ORIGINS`: Allowed CORS origins

### Frontend
- `REACT_APP_BACKEND_API_URL`: Backend API URL (default: http://localhost:8000)

## Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**: Ensure the backend is running on port 8000 and the frontend is configured with the correct API URL.

2. **Database connection errors**: Check that PostgreSQL is running and the connection details are correct.

3. **Authentication errors**: Verify the JWT token is valid and included in request headers.

### Logs

Check container logs:
```bash
docker logs weight-tracker-backend-1
docker logs weight-tracker-frontend-1
docker logs my-postgres
```

### Reset Database

To reset the database:
```bash
docker compose down
docker volume rm weight-tracker_postgres_data
docker compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.