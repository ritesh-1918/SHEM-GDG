# Deployment Guide: Hugging Face Spaces

This guide outlines how to deploy the **SHEM Backend** to Hugging Face Spaces using the Docker SDK.

## Prerequisites
1.  **Hugging Face Account**: [Sign up here](https://huggingface.co/join).
2.  **Supabase Project**: Ensure your database tables are created using the `supabase_schema.sql` file.

## Step-by-step Instructions

### 1. Create a New Space
1.  Go to [huggingface.co/new-space](https://huggingface.co/new-space).
2.  **Space Name**: `shem-backend` (or similar).
3.  **License**: MIT (optional).
4.  **SDK**: Select **Docker** (This is crucial!).
5.  **Template**: Blank.
6.  Click **Create Space**.

### 2. Configure Environment Variables (Secrets)
Before uploading code, set your secrets so the app can connect to Supabase.
1.  In your new Space, go to **Settings** > **Variables and secrets**.
2.  Click **New Secret**. Add the following:
    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (starts with `ey...`).
    *   `JWT_SECRET`: A secure random string for authentication.
    *   (Optional) `OPENWEATHER_API_KEY`: If using weather features.
    *   (Optional) `GEMINI_API_KEY`: If using AI features.

### 3. Upload Code
You have two options to upload the code: using Git (Recommended) or the Web UI.

#### Option A: Using Git (Recommended)
1.  Clone the empty Space repository to your computer (the command is shown on the Space page):
    ```bash
    git clone https://huggingface.co/spaces/YOUR_USERNAME/shem-backend
    ```
2.  Copy the **contents** of your local `shem-pro-backend` directory into this new `shem-backend` directory.
    *   *Note: Ensure `Dockerfile`, `package.json`, and `server.js` are at the root of the repo.*
3.  Commit and push:
    ```bash
    cd shem-backend
    git add .
    git commit -m "Initial deploy"
    git push
    ```

#### Option B: Using Web UI
1.  Go to the **Files** tab of your Space.
2.  Click **Add file** > **Upload files**.
3.  Drag and drop all files from `shem-pro-backend` (excluding `node_modules`).
4.  Commit changes.

### 4. Verify Deployment
1.  The Space will start "Building". Click the **Logs** tab to watch the build process.
2.  Once "Running", you will see a green "Running" badge.
3.  Your API URL will be: `https://YOUR_USERNAME-shem-backend.hf.space`
    *   Example: `https://ritesh-shem-backend.hf.space`

### 5. Update Frontend
1.  Go to your `shem-pro-frontend/.env` file.
2.  Update `VITE_API_BASE_URL` to your new Space URL:
    ```
    VITE_API_BASE_URL=https://YOUR_USERNAME-shem-backend.hf.space/api
    ```
3.  Redeploy your frontend (if deployed) or run locally to test.
