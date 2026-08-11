# Employee Management System (EMS)

A production-style full-stack Employee Management System inspired by the supplied Figma references. It uses a dark navy SaaS sidebar, white content surfaces, indigo primary actions, compact status badges, spacious tables/forms, responsive layouts, JWT + HTTP-only cookie authentication, and MongoDB-backed workflows.

## Features

### Common
- Portal selector for Admin and Employee access
- JWT authentication with HTTP-only cookie
- bcrypt password hashing
- Role-based backend authorization
- Responsive desktop/tablet/mobile layout
- Toasts, loading states, confirmation dialogs and empty states
- Centralized API error handling

### Admin
- Dashboard with live MongoDB statistics and Chart.js visualizations
- Employee CRUD, search, filters and grid/table view
- Employee profile page
- Department CRUD
- Attendance filtering and CSV export
- Leave approval/rejection with balance updates and notifications
- Payroll/payslip generation with backend calculation
- Professional PDF payslip download
- Reports and CSV export
- Notifications
- Password management

### Employee
- Personal dashboard
- Real clock-in/clock-out backed by MongoDB
- Attendance history
- Leave balances and leave application
- Leave overlap and balance validation
- Payslip history and PDF downloads
- Profile update
- Password change
- Notifications

## Technology

- HTML5 / CSS3 / Vanilla JavaScript ES6+
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- PDFKit
- Chart.js
- Lucide icons
- Helmet, CORS, rate limiting, cookie-parser

## Folder Structure

```text
employee-management-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── services/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── admin/
│   ├── employee/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── admin-login.html
│   └── employee-login.html
├── .env.example
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB 6+ locally, or a MongoDB Atlas connection string

## Installation

```bash
git clone <your-repository>
cd employee-management-system
npm install
cp .env.example .env
```

Set `MONGODB_URI` and a strong `JWT_SECRET` in `.env`.

## MongoDB Setup

### Local MongoDB

Use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/employee_management
```

Make sure MongoDB is running before starting the application.

### MongoDB Atlas

Replace `MONGODB_URI` with your Atlas connection string and ensure your database network access allows the machine running the app.

## Seed Demo Data

For the complete demo environment:

```bash
npm run seed
```

This creates:
- 1 admin
- 10 employees
- 10 departments
- attendance records
- leave requests
- payroll records
- notifications

Demo credentials:

**Admin**
- Email: `admin@example.com`
- Password: `admin123`

**Employee**
- Email: `john@example.com`
- Password: `employee123`

The seed script intentionally uses hashed passwords. Do not use these demo credentials in production.

If you only need the administrator account:

```bash
npm run seed:admin
```

Optional environment variables for the admin seed:

```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change-this-password
```

## Run

Development:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The Express server serves the frontend and API from the same origin:

- App: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

This same-origin approach avoids unnecessary frontend CORS configuration. If you serve the frontend separately, set `CLIENT_URL` accordingly.

## Authentication

Authentication is enforced at the API layer. The JWT is stored in an HTTP-only cookie named `ems_token`.

Middleware:
- `authenticateUser`
- `requireAdmin`
- `requireEmployee`

Employee routes use the authenticated user's linked employee record, so an employee cannot request another employee's attendance, leaves or payroll through simply changing a URL.

## REST API

### Auth

```text
POST /api/auth/admin/login
POST /api/auth/employee/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
```

### Employees

```text
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
GET    /api/employees/me
PUT    /api/employees/me
```

### Departments

```text
GET    /api/departments
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id
```

### Attendance

```text
GET  /api/attendance
GET  /api/attendance/mine
POST /api/attendance/clock-in
POST /api/attendance/clock-out
GET  /api/attendance/export
```

### Leaves

```text
GET  /api/leaves
GET  /api/leaves/mine
POST /api/leaves
POST /api/leaves/:id/approve
POST /api/leaves/:id/reject
```

### Payroll

```text
GET  /api/payroll
GET  /api/payroll/mine
GET  /api/payroll/:id
POST /api/payroll
GET  /api/payroll/:id/pdf
```

### Notifications

```text
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
```

### Dashboards

```text
GET /api/dashboard/admin
GET /api/dashboard/employee
```

## Payroll Calculation

Backend service calculation:

```text
Gross = Basic + Allowances + Bonus
Net   = Gross - Tax - PF - Other Deductions
```

The frontend never becomes the source of truth for net salary.

## Security Notes

Implemented:
- bcrypt password hashing
- JWT validation
- HTTP-only auth cookie
- `sameSite=lax`
- secure cookies in production
- Helmet
- CORS
- login rate limiting
- Mongoose validation
- duplicate-key handling
- role checks on APIs
- password exclusion from normal User queries
- centralized error middleware
- no password values in normal API responses

Before production deployment, also configure:
- a high-entropy JWT secret
- HTTPS
- secure cookie settings for your deployment topology
- MongoDB least-privilege credentials
- reverse proxy/rate limits
- backups and monitoring
- real company payroll/tax rules
- real email provider if notifications are emailed

## Troubleshooting

### `MongoDB connected` does not appear
Check MongoDB is running and that `MONGODB_URI` is correct.

### Login says invalid credentials
Run:

```bash
npm run seed:admin
```

or:

```bash
npm run seed
```

### Browser receives HTML instead of JSON
Make sure the Express server is running and the frontend is being served from the same EMS server. API paths must begin with `/api/`.

### Port already in use
Change `PORT` in `.env`, then restart the server.

## Deployment

The app can be deployed as a single Node/Express service because Express serves the static frontend. Use a managed MongoDB service such as MongoDB Atlas, set production environment variables, and run:

```bash
npm install --omit=dev
npm start
```

Put HTTPS in front of the service and use a production-grade process manager/container platform.
