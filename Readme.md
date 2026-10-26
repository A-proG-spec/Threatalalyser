# 🛡️ ThreatLens: Multi-Source Cyber Threat Intelligence Platform

**Graduation Project — INSA Cyber Talent Summer Camp**

**Author:** Anteneh Wondwosen  
**Student ID:** ctc-286-26  
**Department:** Development Department  
**Project:** Graduation Project

---

## 📖 Overview

ThreatLens is a web-based cybersecurity platform that helps users investigate suspicious websites, domains, IP addresses, and URLs. Instead of manually checking multiple security websites (like VirusTotal, URLhaus, and AbuseIPDB), users can search once in ThreatLens to receive a consolidated, easy-to-understand investigation report.

The platform goes beyond simple API aggregation by normalizing data from multiple independent sources, applying a transparent risk-scoring engine, and providing an **AI-powered analyst summary** with **MITRE ATT&CK technique mapping**.

---

## ✨ Key Features

1. **Multi-Source Intelligence Aggregation**
   - Concurrently queries VirusTotal, URLhaus, and AbuseIPDB.
   - Normalizes differing API responses into a unified data model.
   - Handles partial failures gracefully (e.g., if one provider times out, the report still generates using the others).

2. **Transparent Risk-Scoring Engine**
   - Calculates a 0–100 risk score based on detections, source reliability, and corroboration.
   - Assigns a Risk Level: `UNKNOWN`, `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
   - Provides an explanation of *why* a score was assigned.

3. **AI Analyst Summary**
   - Uses Google Gemini API to interpret raw provider JSON.
   - Generates a 2-3 sentence plain-language summary and an actionable recommendation.

4. **MITRE ATT&CK Mapping**
   - Extracts tags from provider data (e.g., "emotet", "c2").
   - Maps them to official MITRE ATT&CK techniques (e.g., T1566 Phishing, T1071 Application Layer Protocol).

5. **Caching & Rate-Limit Management**
   - Uses a PostgreSQL-backed cache (`ThreatCache`) to reduce redundant API calls.
   - Respects provider quotas and enforces rate limits on user requests.

6. **User Authentication & History**
   - JWT-based authentication.
   - Dashboard with global statistics (Total Users, Total Scans, Threats Found).
   - Paginated investigation history for logged-in users.
   - Profile management (update name/email, change password).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS (v4) |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6 |
| **State Management** | React Query (@tanstack/react-query) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **External APIs** | VirusTotal API v3, URLhaus API, AbuseIPDB API v2, Google Gemini API |
| **Testing** | None (per project constraints, focus was on implementation) |

---

## 📂 Project Structure

```text
Threatalalyser/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (7 models)
│   ├── src/
│   │   ├── config/             # Env validation & constants
│   │   ├── lib/                # Prisma client & logger
│   │   ├── middleware/         # Auth, error handling, rate limits
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/           # Register, login, profile
│   │   │   ├── history/        # Dashboard stats, pagination
│   │   │   ├── indicator/      # Normalization & deduplication
│   │   │   └── investigation/  # Orchestration engine
│   │   ├── providers/          # VirusTotal, URLhaus, AbuseIPDB
│   │   ├── risk/               # Scoring engine, AI summary, MITRE
│   │   └── types/              # Shared types
│   └── .env                    # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client & React Query hooks
│   │   ├── components/         # UI components (Navbar, Footer, Modals)
│   │   ├── hooks/              # useAuth
│   │   ├── pages/              # Investigate, Report, Dashboard, Profile
│   │   └── types/              # TypeScript interfaces
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (running locally or via Docker)
- API Keys for:
  - [VirusTotal](https://www.virustotal.com/gui/my-apikey)
  - [URLhaus (abuse.ch)](https://auth.abuse.ch)
  - [AbuseIPDB](https://www.abuseipdb.com/account/api)
  - [Google Gemini](https://aistudio.google.com/) (for AI summary)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/threatlens?schema=public"

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-16-chars"
JWT_EXPIRES_IN="7d"

# External APIs
VIRUSTOTAL_API_KEY="your-virustotal-key"
URLHAUS_API_KEY="your-urlhaus-auth-key"
ABUSEIPDB_API_KEY="your-abuseipdb-key"
GEMINI_API_KEY="your-gemini-key"

# Cache TTLs (in seconds)
CACHE_TTL_VIRUSTOTAL=86400
CACHE_TTL_URLHAUS=3600
CACHE_TTL_ABUSEIPDB=86400
```

Initialize the database and start the server:

```bash
npx prisma db push
npx prisma generate
npm run dev
```

The backend will run on `http://localhost:4000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

---

## 🧪 How to Test

1. **Start the servers:** Ensure both backend (`npm run dev`) and frontend (`npm run dev`) are running.
2. **Register an account:** Navigate to `http://localhost:5173/login` and sign up.
3. **Investigate a clean domain:** Search for `google.com` to see a **LOW** risk result.
4. **Investigate a malicious IP:** Search for `34.124.152.174` to see a **HIGH/CRITICAL** risk result (AbuseIPDB reports this as 100% abuse confidence).
5. **Investigate a malicious URL:** Search for `http://200.115.249.127:34705/.i` to trigger URLhaus and VirusTotal.
6. **Check the AI Summary:** Ensure the Gemini API key is set; the report should show a blue AI Analyst Summary box.
7. **Check the Dashboard:** Logged-in users can view statistics and recent activity.

---

## ⚠️ Important Security Notes

- **Never click or visit the malicious URLs/IPs tested above.** Copy and paste them directly into the ThreatLens search bar.
- This application is for **educational and defensive purposes only**. It does not fetch the URLs themselves (to prevent SSRF attacks) — it only queries approved threat intelligence APIs.
- The `userId` in the database is required, so anonymous scans are assigned to a system "Anonymous User" account. Their history is not visible to other users.

---

## 👨‍💻 Author

**Anteneh Wondwosen**  
**ID:** ctc-286-26  
INSA Cyber Talent Summer Camp  
Development Department

**Project:** ThreatLens — Multi-Source Cyber Threat Intelligence Platform
