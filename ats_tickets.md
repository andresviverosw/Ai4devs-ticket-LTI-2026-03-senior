# LTI Talent Tracking System — Add Candidate Feature: Work Tickets

> **Suggested execution order:** Ticket 1 → Ticket 2 → Ticket 3.
> Each ticket's output is a hard dependency for the next.

---

## 🎫 TICKET 1 — Database: Candidate Data Model & Prisma Migration

**Context:**
We are building an ATS (Applicant Tracking System). This ticket sets up the foundational data layer for the "Add Candidate" feature. There is no existing schema — the Prisma models and PostgreSQL migration must be created from scratch.

**Stack:** PostgreSQL, Prisma ORM (located in `backend/prisma/`)

**Tasks:**
- Define the following models in `backend/prisma/schema.prisma`:

  **`Candidate`**
  - `id` (String, UUID, @default(uuid()), @id)
  - `firstName` (String)
  - `lastName` (String)
  - `email` (String, @unique)
  - `phone` (String?)
  - `address` (String?)
  - `cvFilePath` (String?)
  - `createdAt` (DateTime, @default(now()))
  - `updatedAt` (DateTime, @updatedAt)
  - Relations: `education` (CandidateEducation[]), `experience` (CandidateExperience[])

  **`CandidateEducation`**
  - `id` (String, UUID, @id)
  - `candidateId` (String, FK → Candidate)
  - `institution` (String)
  - `degree` (String)
  - `startDate` (DateTime)
  - `endDate` (DateTime?)

  **`CandidateExperience`**
  - `id` (String, UUID, @id)
  - `candidateId` (String, FK → Candidate)
  - `company` (String)
  - `role` (String)
  - `startDate` (DateTime)
  - `endDate` (DateTime?)
  - `description` (String?)

- Configure the `datasource` block in `schema.prisma` to read `DATABASE_URL` from `backend/.env`
- Run `npx prisma migrate dev --name init_candidate` to generate and apply the migration
- Run `npx prisma generate` to update the Prisma client
- Create a seed script (`backend/prisma/seed.ts`) with at least 5 sample education institutions and companies to support autocomplete later
- Add the seed script to `backend/package.json` under `"prisma": { "seed": "ts-node prisma/seed.ts" }`

**Acceptance Criteria:**
- `npx prisma migrate dev` runs without errors
- All three tables exist in PostgreSQL with correct constraints and foreign keys
- Cascading deletes are configured (`onDelete: Cascade`) on `CandidateEducation` and `CandidateExperience`
- `npx prisma db seed` populates sample data successfully
- Prisma client is generated and importable from `@prisma/client`

---

## 🎫 TICKET 2 — Backend: REST API for Adding a Candidate

**Context:**
With the Prisma schema in place (Ticket 1), this ticket implements the Express API endpoints to support the "Add Candidate" feature. The backend lives in `backend/src/` and is written in TypeScript.

**Stack:** Node.js, Express, TypeScript, Prisma Client, Multer (file uploads)

**Tasks:**
- Install required dependencies:
  - `multer` and `@types/multer` for CV file uploads
  - `zod` (or `express-validator`) for request validation
- Create the following file structure inside `backend/src/`:
  ```
  routes/
    candidate.routes.ts
  controllers/
    candidate.controller.ts
  services/
    candidate.service.ts
  middlewares/
    upload.middleware.ts
    errorHandler.middleware.ts
  ```
- In `candidate.service.ts`, implement business logic using Prisma Client:
  - Create a candidate with nested education and experience records
  - Query existing institutions and companies for autocomplete
- In `candidate.controller.ts`, implement handlers for:
  - `POST /api/candidates` — validates payload, calls service, returns created candidate
  - `POST /api/candidates/:id/upload-cv` — validates file type, saves to `backend/uploads/`, updates `cvFilePath`
  - `GET /api/candidates/autocomplete?field=education&q=` — returns matching institutions or companies
- In `candidate.routes.ts`, wire up the routes and apply the upload middleware
- Register the candidate router in `backend/src/index.ts` under `/api/candidates`
- Handle errors consistently:
  - Duplicate email → 409 Conflict
  - Invalid file type (not PDF or DOCX) → 400 Bad Request
  - Validation failure → 422 Unprocessable Entity
  - Unexpected error → 500 with a safe, user-friendly message
- Add CORS headers in `index.ts` to allow requests from the React frontend (port 3000)
- Store `uploads/` path in `.env` as `UPLOAD_DIR` for configurability

**Acceptance Criteria:**
- `POST /api/candidates` with a valid JSON payload returns 201 and the created candidate object
- Email format validation rejects malformed emails with a 422 response
- `POST /api/candidates/:id/upload-cv` rejects files that are not PDF or DOCX with a 400 response
- `GET /api/candidates/autocomplete` returns a filtered list of matching strings
- All error responses follow a consistent JSON shape: `{ "error": true, "message": "..." }`
- Server starts without errors with `npm run dev` from the `backend/` directory

---

## 🎫 TICKET 3 — Frontend: Add Candidate Form UI

**Context:**
This ticket implements the recruiter-facing interface for adding a candidate. The React app lives in `frontend/src/` and was bootstrapped with Create React App. It connects to the Express API built in Ticket 2.

**Stack:** React, TypeScript, React Hook Form, Axios, TailwindCSS (or CSS Modules if Tailwind is not configured)

**Tasks:**
- Install required dependencies:
  - `react-hook-form` for form state and validation
  - `axios` for API calls
- Create the following structure inside `frontend/src/`:
  ```
  components/
    AddCandidateButton.tsx
    CandidateForm/
      CandidateForm.tsx
      EducationFieldArray.tsx
      ExperienceFieldArray.tsx
      CvUploadField.tsx
  services/
    candidate.api.ts       ← Axios calls to the backend
  ```
- In `candidate.api.ts`, implement:
  - `createCandidate(data)` → `POST /api/candidates`
  - `uploadCv(candidateId, file)` → `POST /api/candidates/:id/upload-cv`
  - `fetchAutocomplete(field, q)` → `GET /api/candidates/autocomplete`
- In `CandidateForm.tsx`, build a multi-section form:
  - **Personal info:** First name, Last name, Email, Phone, Address
  - **Education:** Dynamic list using `useFieldArray` (add/remove entries), with autocomplete suggestions on institution name
  - **Work experience:** Dynamic list using `useFieldArray`, with autocomplete suggestions on company name
  - **CV Upload:** File input restricted to `.pdf` and `.docx`, showing the selected file name as preview
- Implement validation rules via React Hook Form:
  - First name, last name, and email are required
  - Email must match a valid format
  - Uploaded file must be PDF or DOCX
- On form submit:
  1. Call `createCandidate()` with all form data
  2. If a CV file was selected, call `uploadCv()` with the returned candidate ID
  3. On success: show a confirmation banner and reset the form
  4. On error: show a descriptive error message (no raw error dumps)
- Add `AddCandidateButton.tsx` to the recruiter dashboard homepage with a clearly visible CTA
- Ensure the form is fully responsive across mobile, tablet, and desktop viewports
- Point Axios `baseURL` to `http://localhost:4000` (or read from `REACT_APP_API_URL` in `frontend/.env`)

**Acceptance Criteria:**
- "Add Candidate" button is visible and accessible from the dashboard
- All validation errors display inline next to the relevant field before submission
- Successful submission shows a confirmation banner and resets the form to its initial state
- Server errors display a user-friendly message in the UI
- The form renders correctly on mobile and desktop viewports
- No TypeScript compilation errors (`npm run build` passes cleanly)
