<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fYG6niKnbvtVMzmr4CCXWXPlgyO_F5lI

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on GitHub Pages

This repo includes a GitHub Actions workflow in `.github/workflows/deploy.yml` that builds and deploys the `dist/` folder to GitHub Pages.

To enable it:
1. Go to **Settings → Pages** in GitHub.
2. In **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` or `master` (or run the workflow manually from Actions).
