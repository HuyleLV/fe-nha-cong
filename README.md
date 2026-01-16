# Nhà Cộng Frontend

Next.js 15 frontend application for the Nhà Cộng property rental management platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running at `http://localhost:5000` (or configured URL)

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
fe-nha-cong/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Reusable React components
│   ├── features/               # Feature-specific components
│   ├── services/               # API service layer (Axios)
│   ├── utils/                  # Utility functions
│   └── hooks/                  # Custom React hooks
├── public/                     # Public static files
└── .next/                      # Next.js build output
```

## 🔧 Environment Variables (`.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🛠️ Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code
```

## 🎨 Styling
The project uses **Tailwind CSS** for styling.

## 🔐 Authentication
Authentication is handled via JWT tokens stored in `localStorage` (`access_token`, `auth_user`). Axios interceptors automatically attach the token to outgoing requests.
