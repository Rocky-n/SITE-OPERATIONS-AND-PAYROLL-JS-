# JS Constructions - Site Operations Portal

A dedicated internal web application designed to manage construction site operations, focusing on a clean, manual-first workflow for attendance tracking and payroll management. 

## Core Features
* **Smart Attendance Tracking:** Mark daily worker shifts (1 Day, 1.5 Days, Half-day, Absent) with full historical editing and upsert capabilities via a Date Picker.
* **Payroll Management:** Auto-calculate net payable wages. Process payouts via Cash, UPI (Copy & Pay workflow), or Netbanking redirects with two-step confirmation to prevent accidental clicks.
* **Interactive Analytics:** Visual dashboard utilizing Recharts to display 7-day attendance trends and weekly financial payroll expenses.
* **One-Click Export:** Generate and download complete payroll ledgers in Excel format (`.xlsx`) for corporate banking uploads.
* **Modern UI/UX:** Features a dark mode toggle, pulse loading skeletons, and centered micro-interaction toast notifications.

## Tech Stack
* **Frontend:** React.js, Tailwind CSS, Recharts, React Hot Toast
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose)

## Local Setup
1. Clone the repository.
2. Install dependencies in both the frontend and backend directories (`npm install`).
3. Create a `.env` file in the backend directory and add the active database URI: `MONGO_URI="your_mongodb_connection_string"`
4. Run the backend server, followed by the frontend development server.
