### Deployment to Hugging Face Spaces

1. **Create Space**: On Hugging Face, create a New Space -> Select **Docker** SDK.
2. **Secrets**: Go to "Settings" -> "Variables and secrets" in your Space. Add the following secrets from your `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `SMTP_USER`, `SMTP_PASS` (if using email)
   - `TWILIO_ACCOUNT_SID`, etc. (if using SMS)
   - `PORT`: Set this to `7860` (Hugging Face default) or ensure your `server.js` reads `process.env.PORT`.

3. **Upload Code**:
   - Clone the Space repo locally.
   - Copy the contents of `shem-pro-backend` into the repo root.
   - `git add .`, `git commit -m "Deploy backend"`, `git push`.

The backend should start automatically. Use the Space URL as your new Backend URL in the frontend (and rebuild the frontend).
