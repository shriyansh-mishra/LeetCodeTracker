# Coding Profile Tracker

A comprehensive web application for tracking and visualizing coding profiles across multiple platforms including LeetCode, GeeksForGeeks, and CodeForces. This application allows users to connect their profiles from these platforms, aggregate their stats, and display them in a unified dashboard.

## Features

- **Multi-platform Integration**: Connect profiles from LeetCode, GeeksForGeeks, and CodeForces
- **Comprehensive Statistics**: View problem-solving stats, submission history, and language usage
- **Contest History**: Track competition performance across platforms
- **Real-time Updates**: Refresh platform data to get the latest statistics
- **Achievements**: Earn badges based on your coding activity and accomplishments
- **User Authentication**: Secure login and registration system

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Bootstrap, Chart.js, ApexCharts
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: Passport.js
- **External APIs**: LeetCode, GeeksForGeeks, and CodeForces APIs

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/coding-profile-tracker.git
   cd coding-profile-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables (update as needed):
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/coding_profile_tracker
   SESSION_SECRET=your-session-secret
   PORT=3000
   NODE_ENV=development
   ```

4. Set up the database:
   ```
   npm run db:migrate
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in an existing user
- `POST /api/auth/logout` - Log out the current user
- `GET /api/auth/me` - Get the current user's profile

### Platform Verification Endpoints

- `POST /api/verify/leetcode` - Verify a LeetCode username
- `POST /api/verify/geeksforgeeks` - Verify a GeeksForGeeks username
- `POST /api/verify/codeforces` - Verify a CodeForces username

### Dashboard Endpoints

- `GET /api/dashboard` - Get the user's dashboard data with platform statistics
- `POST /api/leetcode/refresh` - Refresh LeetCode data
- `POST /api/geeksforgeeks/refresh` - Refresh GeeksForGeeks data
- `POST /api/codeforces/refresh` - Refresh CodeForces data

## Data Sources

- LeetCode API: [github.com/shriyansh-mishra/leetcode-profile](https://github.com/shriyansh-mishra/leetcode-profile)
- GeeksForGeeks API: [github.com/pratham1singh/API-To-Fetch-GFG-user-Data](https://github.com/pratham1singh/API-To-Fetch-GFG-user-Data)
- CodeForces API: [github.com/mahmudulahsan/my-CodeForces-web-app](https://github.com/mahmudulahsan/my-CodeForces-web-app)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.