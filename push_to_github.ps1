# Push to GitHub Script
# Run this to upload your code to the 'ritesh-1918/SHEM-GDG' repository.

Write-Host "Pushing code to GitHub..." -ForegroundColor Cyan
Write-Host "Repo: https://github.com/ritesh-1918/SHEM-GDG.git" -ForegroundColor Gray

# Ensure we are on main
git checkout main

# Push
Write-Host "You may be prompted to sign in to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($?) {
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
}
else {
    Write-Host "Push failed. Please check your internet or credentials." -ForegroundColor Red
}
