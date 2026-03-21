# Rental Management System - Frontend App

This is the official frontend application for the Rental Management System (RMS), built with Next.js, TypeScript, and Tailwind CSS. It provides a sleek and intuitive interface for operational management.

## 🚀 Technology Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS / Vanilla CSS
- **Components**: Radix UI / Shadcn UI
- **Icons**: Lucide React
- **Notifications**: Sonner (Success/Error toasts)
- **HTTP Client**: Axios (with JWT Interceptor)
- **State**: React Context (AuthProvider)

## 📂 Layout Overview
- **`app/login`**: Standalone entry point for authorized users.
- **`app/(dashboard)`**: Route group containing all operational modules protected by Auth Guard.
- **`contexts/`**: Central authentication state management.
- **`components/`**: Modularized UI elements (Inventory, Bookings, Returns, etc.).
- **`lib/api.ts`**: Axios client configured for backend integration.

## 🛠️ Getting Started

### 1. Installation
Install the required packages in the `rms-frd` folder:
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Launch Development Server
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

## 🔐 Core Features

### 🛡️ Authentication Shield
- **Login Portal**: A premium glassmorphic interface for secure access.
- **Auth Provider**: Custom `useAuth` hook manages JWT persistence in `localStorage`.
- **Protected Layouts**: Automatic redirection to `/login` for unauthenticated sessions.
- **JWT Interceptor**: Requests to the backend are automatically signed with a Bearer token.

### 📋 Operational Modules
- **Dynamic Dashboard**: Live analytics fetching real-time data from the backend.
- **Inventory Registry**: Categorized item management with bulk serial number support.
- **Client Management**: CRM-lite features for tracking customer booking history.
- **Logistics Flow**: End-to-end status tracking from Reservation → Ready → Delivered → Returned.
- **Financial Desk**: Tracking payments, advance deposits, and overdue receipts.

## 💡 Quick Login
Use the seeded credentials from the backend:
- **Identifier**: `admin@codeaqua.lk`
- **Passphrase**: `admin123`
