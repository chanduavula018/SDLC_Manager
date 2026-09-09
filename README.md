# NeuroForge - Enterprise SDLC & DevOps Platform

NeuroForge is an Enterprise SDLC and DevOps Management Platform engineered with a **Java Spring Boot** backend and a **React + TypeScript + Vite** frontend.

---

## 🏗️ Project Architecture

- **Backend**: Java 17, Spring Boot 3/4 (Controller -> Service -> Repository -> JPA/Hibernate -> PostgreSQL)
  - API Base: `http://localhost:8080/api/...`
  - 11 Functional Modules: Users, Projects, Requirements, Tasks, Test Cases, Bug Reports, Documentation, Versions, Builds, Environments, Deployments.
- **Frontend**: React 18/19, TypeScript, Vite, Tailwind CSS, React Router v6, Axios
  - Location: `./frontend`
  - Dev Server: `http://localhost:3000` (with proxy to `http://localhost:8080`)

---

## 🚀 How to Run

### 1. Prerequisites
- **Java 17+** installed & configured
- **PostgreSQL 14+** running locally on port `5432` with database `enterprise_sdlc_devops` (username `postgres`)
- **Node.js 18+** & `npm` installed

---

### 2. Run the Spring Boot Backend

From the root directory:

```bash
# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

The backend server will start on **http://localhost:8080**.

---

### 3. Run the React Frontend

Open a new terminal window in the root directory:

```bash
cd frontend
npm run dev
```

The frontend application will launch on **http://localhost:3000**.

---

## 🌟 Key Frontend Features

1. **Dashboard Analytics**: Real-time aggregated metrics across all 11 modules with metric cards and quick action shortcuts.
2. **11 Interactive Module Managers**: Dedicated paginated, sortable, and searchable data tables for:
   - **Users**: Credentials & role assignment (`ADMIN`, `DEVELOPER`, `QA_TESTER`, etc.)
   - **Projects**: Project owners, dates, and status lifecycle.
   - **Requirements**: Priority ranking and project linkage.
   - **Tasks**: Work items, deadlines, linked requirements & projects.
   - **Test Cases**: Automated/manual test suites, expected results, execution status.
   - **Bug Reports**: Severity triage and failing test case links.
   - **Documentation**: Knowledge base & tech specs linked to tasks.
   - **Versions**: Semantic release tags and target dates.
   - **Builds**: CI/CD build artifacts and version links.
   - **Environments**: Deployment targets (Dev, Staging, Prod).
   - **Deployments**: Release audit trail mapping Builds, Versions, Projects, and Environments.
3. **Relational Dropdowns**: Real foreign keys are pre-fetched and rendered as human-readable select dropdowns (e.g. pick a Project by name when creating a Task or Requirement).
4. **State Resilience**: Comprehensive loading spinners, empty state prompts, and retry error alerts.
