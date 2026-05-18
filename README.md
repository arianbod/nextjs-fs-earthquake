# QuakeWise — Earthquake Safety Assessment

This app is the software artifact of an ongoing ECE Master's thesis on seismic risk estimation. It's produced two first-author conference papers so far: one presented at a conference in Greece in 2025, and a second accepted at a conference in Bosnia in May 2026. The underlying method is based on FEMA's Rapid Visual Screening methodology, extended with additional scoring modifiers and an AI-assisted building photo analysis step.

## What it does

Users walk through an 8-step structural assessment form. They enter details about their building — construction type (wood frame, concrete shear wall, steel moment-resisting frame, and ~15 other FEMA categories), number of stories, soil type, seismic zone, plan and vertical irregularities, neighboring building conditions, and any extra loads. The app runs FEMA-derived scoring with modifiers for pre-code construction, benchmark compliance, and soil class, then produces a safety score, a performance level estimate, and a cost-benefit breakdown. There's also an optional image upload step where a photo of the building's exterior gets analyzed by an LLM to suggest structural characteristics. Results display with performance charts, a building comparison chart, and an enhanced certificate.

An AI assistant persona (QuakeWise) guides users through each step and answers questions inline.

## Stack

- **Next.js 14** (App Router, JavaScript + some TypeScript)
- **Clerk** for authentication (sign-in, sign-up, protected routes via middleware)
- **OpenAI API** for the in-app chat assistant
- **Google Maps** (`@react-google-maps/api`) for location selection
- **TanStack Query v5** for server state
- **Framer Motion** for step transitions
- **Recharts** for the results charts
- **Radix UI** + **Tailwind CSS** for the component layer
- **SendGrid** for email (certificate delivery)
- **Vitest** + Testing Library + MSW — 150+ tests covering calculations, API routes, and components

## Getting Started

```bash
npm install
# or
pnpm install
```

Copy `.env.example` to `.env.local` and fill in your keys (Clerk, OpenAI, Google Maps, SendGrid).

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

Run the test suite:

```bash
npm run test:run
```

## Notes

The FEMA scoring tables live in `components/femaSeismicSafetyCalculator.js`. The multi-step form state is managed through a React context (`context/UserInputContext.jsx`). Each form step is a separate component under `components/steps/`. API routes are under `app/api/` — all require Clerk authentication.
