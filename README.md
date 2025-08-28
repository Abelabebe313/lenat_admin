# Lenat Admin Panel

A comprehensive admin dashboard built with Next.js and Material-UI for managing Lenat platform operations.

## Features

- 🔐 **Authentication System** - Secure login and user management
- 👥 **User Management** - Complete user administration
- 📝 **Blog Post Management** - Content creation and editing
- 📰 **Content Feed Management** - Dynamic content feeds
- 🛒 **Marketplace Management** - Product and transaction oversight
- 🎮 **Trivia Game Management** - Game administration and analytics

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the admin panel.

## Tech Stack

- **Frontend**: Next.js 15, React 18
- **UI Framework**: Material-UI (MUI) v6
- **Styling**: Tailwind CSS + CSS Modules
- **Icons**: Iconify
- **State Management**: React Context API

## Project Structure

```
src/
├── app/                    # Next.js app router
├── @core/                 # Core components and utilities
├── @layouts/              # Layout components
├── @menu/                 # Navigation menu system
├── components/            # Shared components
├── views/                 # Page components
└── data/                  # Navigation and configuration data
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
