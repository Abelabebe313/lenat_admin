# Environment Variables Setup

This document explains how to set up environment variables for the Lenat Admin application.

## Quick Start

1. **Create `.env.local` file** in the root directory of the project
2. **Copy the template below** and fill in your values
3. **Never commit** `.env.local` to version control (it's already in `.gitignore`)

## Environment Variables Template

Create a `.env.local` file in the root directory with the following content:

```env
# GraphQL API Configuration
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.lenatmom.com/v1/graphql

# Hasura Admin Secret
NEXT_PUBLIC_HASURA_ADMIN_SECRET=your_admin_secret_here

# Environment
NEXT_PUBLIC_APP_ENV=development
```

## Environment Variables Explained

### `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
- **Description**: The GraphQL API endpoint URL
- **Required**: Yes
- **Example Values**:
  - Production: `https://api.lenatmom.com/v1/graphql`
  - Development: `http://92.205.167.80:8080/v1/graphql`
- **Default**: `https://api.lenatmom.com/v1/graphql`

### `NEXT_PUBLIC_HASURA_ADMIN_SECRET`
- **Description**: Hasura admin secret for API authentication
- **Required**: Yes
- **Security**: ⚠️ Keep this secret! Never commit it to version control
- **Default**: Empty string (will cause errors if not set)

### `NEXT_PUBLIC_APP_ENV`
- **Description**: Application environment (development/production)
- **Required**: No
- **Values**: `development` | `production`
- **Default**: `development`

## Setup Instructions

### For Local Development

1. Create `.env.local` file:
   ```bash
   touch .env.local
   ```

2. Add your configuration:
   ```env
   NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.lenatmom.com/v1/graphql
   NEXT_PUBLIC_HASURA_ADMIN_SECRET=123
   NEXT_PUBLIC_APP_ENV=development
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### For Production

1. Set environment variables in your hosting platform:
   - **Vercel**: Go to Project Settings → Environment Variables
   - **Netlify**: Go to Site Settings → Environment Variables
   - **Other platforms**: Check their documentation for environment variable setup

2. Set the following variables:
   - `NEXT_PUBLIC_GRAPHQL_ENDPOINT` = Your production GraphQL endpoint
   - `NEXT_PUBLIC_HASURA_ADMIN_SECRET` = Your production admin secret
   - `NEXT_PUBLIC_APP_ENV` = `production`

## Important Notes

⚠️ **Security Best Practices:**
- Never commit `.env.local` or any `.env` files to version control
- Use different admin secrets for development and production
- Rotate secrets regularly
- Never share secrets in public channels or documentation

📝 **Next.js Environment Variables:**
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Variables without `NEXT_PUBLIC_` are only available on the server
- Changes to `.env.local` require a server restart

## Troubleshooting

### Variables not working?
1. Make sure the file is named `.env.local` (not `.env.local.txt`)
2. Restart your development server after adding/changing variables
3. Check that variable names start with `NEXT_PUBLIC_` for client-side access
4. Verify there are no spaces around the `=` sign

### Still having issues?
- Check the browser console for errors
- Verify the variables are being loaded: `console.log(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT)`
- Make sure you're using the correct variable names (case-sensitive)


