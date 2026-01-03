# Deploy to Hugging Face Spaces Script
# This script initializes a git repo in the current directory and pushes to HF

Write-Host "Starting Deployment to Hugging Face..." -ForegroundColor Green

# 1. Initialize Git if not exists
if (-not (Test-Path ".git")) {
    git init
    Write-Host "Initialized Git repository." -ForegroundColor Yellow
}

# 2. Add Remote
# Check if remote exists
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    git remote add origin https://huggingface.co/spaces/ritesh1918/shem-backend
    Write-Host "Added remote 'origin'." -ForegroundColor Yellow
} else {
    git remote set-url origin https://huggingface.co/spaces/ritesh1918/shem-backend
    Write-Host "Updated remote 'origin'." -ForegroundColor Yellow
}

# 3. Add Files
git add .
Write-Host "Staged files." -ForegroundColor Yellow

# 4. Commit
git commit -m "Deploy to HF Space"
Write-Host "Committed files." -ForegroundColor Yellow

# 5. Push
Write-Host "Ready to push..." -ForegroundColor Cyan
Write-Host "You may be prompted for your Hugging Face Username (ritesh1918) and Access Token (Password)." -ForegroundColor Cyan
git push --force origin master

Write-Host "Deployment command finished." -ForegroundColor Green
