# AuditAI: Dashboard & Agent Portal 🎨

The AuditAI frontend is a modern, high-performance React application designed to provide supervisors and agents with real-time insights into customer support quality.

## 🌟 Key Views

### 1. Dashboard View (`src/components/DashboardView.tsx`)
- High-level overview of auditing performance.
- Interactive charts showing compliance trends and agent scores.
- Real-time alerts for critical violations.

### 2. Reports View (`src/components/ReportsView.tsx`)
- Detailed list of all audit records.
- Filtering by date, agent, and compliance status.
- **PDF Export**: Generate professional audit reports directly from the browser.

### 3. Agent Portal (`src/components/AgentPortalView.tsx`)
- Personalized view for support agents.
- Track individual performance metrics and feedback.
- Access to historical audit results for self-improvement.

### 4. Interactive Bot Simulation (`src/components/LiveAuditView.tsx`)
- Test and train agents using an AI-simulated customer.
- Real-time transcription and scoring of the interaction.

---

## 🛠️ Tech Stack

- **React 19**: Leveraging React Server Components (where applicable) and modern hooks.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS**: For a sleek, responsive, and maintainable design system.
- **Framer Motion**: Smooth transitions and micro-interactions for a premium feel.
- **Recharts**: Data-driven visualizations for analytics.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running (see root README)

### Installation
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    Create a `.env.local` file in the `frontend/` directory:
    ```bash
    VITE_API_BASE_URL="http://localhost:3000"
    VITE_GEMINI_API_KEY="your_gemini_key"
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev:client
    ```

---

## 📁 Folder Structure

- `src/components/`: Reusable UI components and major page views.
- `src/services/`: API integration and Gemini LLM orchestration.
- `src/hooks/`: Custom React hooks for state management and side effects.
- `src/assets/`: Static assets and global styles.
