# Aether AI Expense Management 🚀

A next-generation, immersive 3D interactive SaaS platform for autonomous spend intelligence. Built with a modern React stack, this application features cinematic animations, scroll-driven storytelling, and premium micro-interactions designed for fast-moving finance teams.

## ✨ Features

- **Immersive 3D Experience:** Hardware-accelerated 3D elements including interactive particle networks, floating holographic expense cards, and dynamic data streams powered by React Three Fiber.
- **Cinematic Animations:** Smooth scroll-driven reveals, parallax depth effects, and staggered staggered element entrances using Framer Motion and GSAP.
- **Robust Theme System:** Fully adaptive Light and Dark modes with smooth transition animations, backed by CSS custom properties and localized persistence.
- **Secure Authentication:** Seamless Google OAuth 2.0 integration via NextAuth.js.
- **Protected Dashboard:** Secure router boundaries, real-time stat counters, spending trend charts, and an AI-driven transaction feed.
- **AI Assistant Interface:** Natural language command interface with simulated AI typing animations and "thinking" indicators.
- **Premium UI:** Glassmorphism effects, custom glow borders, animated sweep transitions, and a highly polished Tailwind CSS + ShadCN component library.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (via [ShadCN](https://ui.shadcn.com/))
- **Animations:** [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **3D / WebGL:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) & Drei
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Charts:** [Recharts](https://recharts.org/)

## 🚀 Getting Started

### Prerequisites

You need Node.js and npm (or pnpm/yarn) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd ai-expense-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following keys. You will need to obtain Google OAuth credentials from the Google Cloud Console.
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_generated_random_secret
   ```
   *(To generate a `NEXTAUTH_SECRET`, you can run `openssl rand -base64 32` in your terminal).*

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to see the application.

## 📁 Project Structure

```text
src/
├── app/                  # Next.js App Router layout, pages, and API routes
│   ├── api/auth/         # NextAuth endpoint
│   ├── dashboard/        # Protected dashboard page
│   ├── login/            # Authentication page with 3D background
│   ├── globals.css       # CSS theme variables and custom keyframes
│   ├── layout.tsx        # Root layout with Theme and Auth providers
│   └── page.tsx          # Main landing page
├── components/           # Reusable UI components
│   ├── charts/           # Recharts data visualizations
│   ├── sections/         # Landing page sections (Hero, Features, AI Assistant, etc.)
│   ├── three/            # WebGL & React Three Fiber components
│   └── ui/               # Primitive components (Buttons, Inputs, Cards)
└── lib/                  # Utilities and configurations (NextAuth config)
```

## 🎨 Theme Customization

The color system is entirely driven by CSS variables defined in `src/app/globals.css`. To modify the primary brand colors or adjust the light/dark mode palettes, update the variables inside the `:root` and `[data-theme="dark"]` selectors.

## 📜 License

This project is proprietary and confidential. All rights reserved.
