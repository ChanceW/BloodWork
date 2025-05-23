# Blood Work Results Web App

## Overview
This is a web application for a laboratory to manage blood work results and allow customers to view their results securely. The app includes a customer portal for viewing results and a lab staff portal for uploading and managing results. It is built using Next.js for both frontend and backend, Tailwind CSS for styling, Prisma as the ORM for database interactions, and Auth.js for authentication. PostgreSQL is used for both data and asset storage (e.g., PDF results).

## Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM for data and asset storage)
- **Authentication**: Auth.js (NextAuth.js) with JWT and email provider
- **Deployment**: Docker with a `Dockerfile` for containerized deployment
- **Compliance**: HIPAA-compliant data handling

## Prerequisites
- Node.js (v18 or later)
- PostgreSQL (local or cloud-hosted, e.g., hosted PostgreSQL service)
- Docker (for deployment)
- Yarn or npm
- Prisma CLI (`npm install -g prisma`)

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd blood-work-results-app
   ```

2. **Install Dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/bloodworkdb?schema=public"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
   EMAIL_FROM="noreply@labapp.com"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```
   - Replace `DATABASE_URL` with your PostgreSQL connection string.
   - Generate a secure `NEXTAUTH_SECRET` (e.g., `openssl rand -base64 32`).
   - Configure `EMAIL_SERVER` and `EMAIL_FROM` for email-based password resets (e.g., using an SMTP service like SendGrid).
   - Set `NEXTAUTH_URL` to the app’s base URL (update for production).

4. **Initialize the Database**
   ```bash
   npx prisma migrate dev --name init
   ```
   This runs Prisma migrations to set up the database schema for users, results, and assets.

5. **Run the Development Server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

6. **Build for Production**
   ```bash
   yarn build
   yarn start
   # or
   npm run build
   npm start
   ```

## Docker Deployment
1. **Build the Docker Image**
   ```bash
   docker build -t blood-work-results-app .
   ```

2. **Run the Docker Container**
   ```bash
   docker run -p 3000:3000 --env-file .env blood-work-results-app
   ```
   Ensure the `.env` file is available on the host machine or pass environment variables directly.

3. **Dockerfile**
   The `Dockerfile` is configured for production:
   - Uses Node.js 18 base image.
   - Installs dependencies, builds the Next.js app, and runs it with `next start`.
   - Exposes port 3000.

## Project Structure
```
blood-work-results-app/
├── app/                    # Next.js app directory (pages, API routes)
│   ├── api/                # Backend API routes
│   │   ├── auth/[...nextauth].ts  # Auth.js routes
│   │   ├── results/        # Result management (GET, POST, PUT, DELETE)
│   │   └── assets/         # Asset management (upload, retrieve)
│   ├── customer/           # Customer portal pages
│   ├── staff/              # Lab staff portal pages
│   └── layout.tsx          # Root layout with Tailwind CSS
├── prisma/                 # Prisma schema and migrations
│   └── schema.prisma       # Database schema
├── public/                 # Static assets (e.g., favicon, images)
├── components/             # Reusable React components
├── lib/                    # Utility functions (e.g., Auth.js config, asset handling)
├── styles/                 # Tailwind CSS configuration
├── .env.example            # Template for environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── Dockerfile              # Docker configuration for deployment
└── README.md               # This file
```

## Key Features
### Customer Portal
- **Authentication**: Register/login via email and password using Auth.js, with email-based password reset.
- **Results Viewing**: View blood work results in a table with test name, date, values, and reference ranges.
- **Asset Rendering**: Download results as PDFs stored in PostgreSQL (via API).
- **Notifications**: Email alerts for new results (configured via `EMAIL_SERVER`).

### Lab Staff Portal
- **Authentication**: Role-based access (admin/standard) via Auth.js with custom user roles in PostgreSQL.
- **Result Management**: Upload results (structured data or PDFs), edit, or delete with audit logging.
- **Asset Management**: Upload PDFs to PostgreSQL via `/api/assets/upload`, retrieve via `/api/assets/[id]`.
- **User Management**: Admins can create/deactivate staff accounts.

### Security
- **Data Encryption**: HTTPS, encrypted database fields for PHI (Protected Health Information) using PostgreSQL’s `BYTEA` for assets.
- **HIPAA Compliance**: Ensure database hosting complies with HIPAA (e.g., encrypt sensitive fields, use secure connections).
- **Authentication**: Auth.js with JWT strategy, bcrypt for password hashing (handled by Auth.js).

## Database Schema (Prisma)
The `schema.prisma` file defines the following models:
- **User**: Stores customer and staff data (email, password hash, role, patient ID).
- **Result**: Stores blood work results (patient ID, test name, date, values, asset ID for PDF).
- **Asset**: Stores PDF files as `BYTEA` (id, file data, content type, uploaded by, timestamp).
- **AuditLog**: Tracks changes to results (action, user, timestamp).

Run `npx prisma studio` to view and manage the database.

## API Endpoints
- **Auth**: `/api/auth/[...nextauth]` (handled by Auth.js for login, register, reset).
- **Results**:
  - `GET /api/results`: Fetch customer results (authenticated).
  - `POST /api/results`: Upload result (staff only).
  - `PUT /api/results/[id]`: Edit result (staff only).
  - `DELETE /api/results/[id]`: Delete result (staff only, with audit log).
- **Assets**:
  - `POST /api/assets/upload`: Upload PDF file to PostgreSQL (staff only).
  - `GET /api/assets/[id]`: Retrieve PDF file (authenticated, authorized users only).
- **Staff**:
  - `POST /api/staff/users`: Create staff account (admin only).
  - `DELETE /api/staff/users/[id]`: Deactivate staff account (admin only).

## Asset Storage
- PDFs are stored in PostgreSQL’s `Asset` table as `BYTEA` data.
- The `/api/assets/upload` endpoint accepts file uploads and stores them with metadata (content type, uploader, timestamp).
- The `/api/assets/[id]` endpoint retrieves PDFs, setting appropriate headers (`Content-Type: application/pdf`).
- Ensure database is optimized for large `BYTEA` fields (e.g., use `TOAST` for compression).

## Styling
- Tailwind CSS is used for responsive, utility-first styling.
- Customize styles in `tailwind.config.js` and `app/globals.css`.

## Deployment
1. **Build and Run Locally with Docker**
   ```bash
   docker build -t blood-work-results-app .
   docker run -p 3000:3000 --env-file .env blood-work-results-app
   ```

2. **Deploy to a Server**
   - Push the Docker image to a registry (e.g., Docker Hub).
   - Deploy to a server with Docker support (e.g., AWS EC2, Google Cloud, or a VPS).
   - Configure a reverse proxy (e.g., Nginx) for HTTPS.
   - Ensure PostgreSQL is hosted securely (e.g., with SSL and restricted access).

3. **HIPAA Compliance**
   - Use a HIPAA-compliant PostgreSQL provider (e.g., AWS RDS with encryption).
   - Enable encryption for data at rest and in transit.
   - Implement access controls and audit logging.

## Development Notes
- **Prisma**: Run `npx prisma generate` after schema changes.
- **Auth.js**: Configure providers in `app/api/auth/[...nextauth]/route.ts`. Extend user model for roles (customer, staff, admin).
- **Tailwind**: Extend styles in `tailwind.config.js` for custom theming.
- **Testing**: Add unit tests with Jest and integration tests with Cypress (TBD).
- **Security**: Regularly audit dependencies (`npm audit`) and perform penetration testing.
- **Asset Storage**: Monitor PostgreSQL performance for large `BYTEA` data; consider indexing for faster retrieval.

## Contributing
- Follow conventional commits for commit messages.
- Submit pull requests with clear descriptions of changes.
- Ensure code passes linting (`yarn lint`) and tests.

## License
Proprietary - Built for [Client Name]. Contact the client for usage rights.