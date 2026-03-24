# Society Pro Management System

Welcome to the Society Pro Management System! This is a comprehensive full-stack application designed to streamline the management of residential societies. It provides a robust platform for both administrators and residents to handle daily operations, payments, and communications efficiently.

## 🚀 Features

### For Administrators
- **Dashboard & Analytics:** View key metrics and graphical reports of society finances.
- **Flat & Resident Management:** Manage flat details, owner information, and assignments.
- **Subscription Fees:** Set and update monthly maintenance and subscription fees.
- **Payment Tracking:** Monitor resident payments and generate detailed financial reports.
- **Notifications Engine:** Broadcast announcements and track read receipts from residents.
- **Monthly Records:** Generate and maintain historical records.

### For Residents
- **Personalized Dashboard:** View outstanding dues, payment history, and recent notices.
- **Bill Payments:** Securely pay maintenance bills and download auto-generated PDF invoices.
- **Profile Management:** Update contact information and personal details.
- **Real-time Notifications:** Receive updates with unread indicators and read-receipt functionality.

## 🛠️ Technology Stack

**Frontend Framework:** Next.js (React 19)
**Styling:** Tailwind CSS, Lucide Icons
**Data Visualization:** Recharts
**PDF Generation:** jsPDF 
**Backend Server:** Node.js with Express
**Database:** PostgreSQL (with `pg` package)
**Authentication:** JWT, Passport.js (Google OAuth 2.0), bcrypt
**Security & Utility:** CORS, cookie-parser

## 📂 Project Structure

- `/frontend/`: Contains the Next.js application.
  - `app/admin/`: Administrator views and layouts.
  - `app/resident/`: Resident views and layouts.
  - `components/`: Reusable UI components.
- `/backend/`: Contains the Express.js API server.
  - `src/controllers/`: Business logic and request handling.
  - `src/routes/`: API endpoint definitions.
  - `server.js` & `app.js`: Server configuration and entry points.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL Database
- Google OAuth Credentials (for social login)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Configure your .env file with DB credentials, JWT secret, and Google OAuth keys
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Configure your .env.local file with the NEXT_PUBLIC_API_URL
   npm run dev
   ```

