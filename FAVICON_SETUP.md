# Favicon Setup Guide - Lenat Logo

## Overview
This guide will help you replace the default favicon with the Lenat logo.

## Steps to Add Lenat Logo as Favicon

### Option 1: Using a PNG/Image File (Recommended)

1. **Prepare your logo file:**
   - Make sure you have the Lenat logo in PNG format
   - Recommended sizes:
     - `favicon.ico` - 32x32 or 48x48 pixels (multi-size ICO format)
     - `favicon-16x16.png` - 16x16 pixels
     - `favicon-32x32.png` - 32x32 pixels
     - `apple-touch-icon.png` - 180x180 pixels (for iOS devices)

2. **Convert your logo to ICO format:**
   - Use an online tool like [favicon.io](https://favicon.io/favicon-converter/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
   - Upload your logo image
   - Download the generated favicon files

3. **Place files in the public directory:**
   ```
   public/
   ├── favicon.ico          (main favicon)
   ├── favicon-16x16.png   (16x16 PNG)
   ├── favicon-32x32.png   (32x32 PNG)
   └── apple-touch-icon.png (180x180 PNG for iOS)
   ```

4. **Replace the existing favicon:**
   - The current favicon is at: `src/app/favicon.ico`
   - You can either:
     - Replace `src/app/favicon.ico` directly, OR
     - Place `favicon.ico` in the `public/` folder (Next.js will use it automatically)

### Option 2: Quick Setup with Online Tools

1. **Visit [favicon.io](https://favicon.io/favicon-converter/)**
2. **Upload your Lenat logo image**
3. **Download the generated favicon package**
4. **Extract and copy files to:**
   - `public/favicon.ico`
   - `public/favicon-16x16.png`
   - `public/favicon-32x32.png`
   - `public/apple-touch-icon.png`

### Option 3: Using SVG (Modern Approach)

If you have the Lenat logo as an SVG:

1. **Create `public/icon.svg`** with your logo SVG
2. **Update `src/app/layout.jsx`** metadata to include:
   ```javascript
   icons: {
     icon: '/icon.svg',
     apple: '/apple-touch-icon.png',
   }
   ```

## File Locations

- **Current favicon:** `src/app/favicon.ico`
- **Public directory:** `public/` (files here are served at root `/`)
- **Layout config:** `src/app/layout.jsx` (already updated with icon metadata)

## Testing

After adding your favicon files:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
   - Or open in incognito/private mode

3. **Check the favicon:**
   - Look at the browser tab
   - Check `http://localhost:3000/favicon.ico` directly

## Notes

- Next.js 13+ automatically serves `favicon.ico` from the `app` directory
- Files in `public/` are accessible at the root URL (e.g., `/favicon.ico`)
- The metadata configuration in `layout.jsx` ensures proper icon linking
- For best results, use square images with transparent backgrounds

## Troubleshooting

**Favicon not showing?**
- Clear browser cache
- Check file names match exactly (case-sensitive)
- Verify files are in the correct location
- Check browser console for 404 errors

**Icon looks blurry?**
- Use higher resolution source images
- Ensure you're using the correct size for each icon
- Use PNG format for better quality

## Current Configuration

The `src/app/layout.jsx` file has been updated with proper icon metadata that supports:
- Standard favicon (favicon.ico)
- PNG icons (16x16, 32x32)
- Apple touch icon (180x180 for iOS)

Once you add your logo files, they will automatically be used!


