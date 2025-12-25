# cryptalk

A private, self-destructing chat room application built with Next.js, Elysia, and Upstash.

## Features

- **Ephemeral Rooms**: Rooms are automatically destroyed after a set period (default 10 minutes).
- **Secure**: Basic token-based authentication (cookies) prevents unauthorized access to rooms.
- **Real-time**: Instant messaging powered by Upstash Realtime.
- **Anonymous**: No login required. Get a randomly generated username, create a room and chat.
- **Room Limits**: Maximum 2 participants per room for 1:1 privacy.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Backend**: [ElysiaJS](https://elysiajs.com/) (running in Next.js API Routes)
- **Database**: [Upstash Redis](https://upstash.com/redis)
- **Realtime**: [Upstash Realtime](https://upstash.com/docs/realtime/overall/getstarted)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Validation**: [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

- Node.js 18+
- An [Upstash](https://upstash.com/) account (for Redis and Realtime)

### Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Upstash credentials:

```env
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

> Note: Ensure your Upstash Realtime is enabled and configured if required implicitly by the SDKs.

### Installation

```bash
npm install
# or
pnpm install
```

### Running Locally

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `src/app/api`: Contains the Elysia backend entry point.
- `src/app/room/[roomId]`: The chat room UI.
- `src/lib/realtime.ts`: Server-side Realtime configuration.
- `src/lib/realtime-client.ts`: Client-side Realtime configuration.
- `src/proxy.ts`: Middleware/Proxy logic for room access and token management.
