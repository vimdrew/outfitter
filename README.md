# Outfitter

A minimalist wardrobe management app for organizing clothing items and creating outfits. Built with a clean, streetwear-inspired aesthetic.

![Outfitter](./docs/screenshot.png)

## Features

- **Wardrobe Management** - Upload and organize your clothing items with automatic color detection
- **Smart Filtering** - Filter by category, colors that actually exist in your wardrobe, and season
- **Outfit Builder** - Create outfits by selecting items from your wardrobe
- **Wear Tracking** - Track how many times you've worn each item or outfit
- **Auto Color Extraction** - Automatically detects colors from uploaded clothing photos using client-side image analysis

## Tech Stack

- [TanStack Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) + shadcn/ui
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
- [Better Auth](https://www.better-auth.com/) for authentication
- [Cloudinary](https://cloudinary.com/) for image hosting

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Cloudinary account (for image uploads)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/vimdrew/outfitter.git
cd outfitter
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your credentials:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/outfitter"
BETTER_AUTH_SECRET=<generate-with-pnpm-auth-secret>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
CLOUDINARY_UPLOAD_PRESET=<your-upload-preset>
```

5. Start PostgreSQL with Docker:

```bash
docker-compose up -d
```

6. Generate and apply database migrations:

```bash
pnpm db generate
pnpm db migrate
```

7. Start the development server:

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── ClothingItemCard.tsx
│   ├── FilterBar.tsx
│   ├── ItemUploadDialog.tsx
│   └── WardrobeView.tsx
├── lib/
│   ├── auth/            # Better Auth configuration
│   ├── cloudinary/      # Cloudinary upload utilities
│   ├── colors.ts        # Color extraction utilities
│   ├── db/              # Drizzle ORM setup
│   └── wardrobe/        # Wardrobe types and server functions
├── routes/              # TanStack Router routes
└── styles.css           # Global styles
```

## Available Scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `pnpm dev`         | Start development server     |
| `pnpm build`       | Build for production         |
| `pnpm start`       | Start production server      |
| `pnpm lint`        | Run type-aware linting       |
| `pnpm format`      | Format code                  |
| `pnpm db generate` | Generate database migrations |
| `pnpm db migrate`  | Apply database migrations    |
| `pnpm db studio`   | Open Drizzle Studio          |

## Color System

The app uses a simplified 10-color palette:

- Black, White, Gray, Navy, Blue, Red, Green, Brown, Beige, Multi

Colors are automatically extracted from uploaded images using client-side color analysis, but users can manually override if needed.

## License

MIT
