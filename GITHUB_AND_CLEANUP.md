# GitHub Setup & Old Folder Cleanup

## 1. Push to GitHub

### Configure Git (one-time, if not done)
```powershell
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

### Commit and push
```powershell
cd "c:\Users\user\OneDrive\Attachments\New folder\speech-emotion-recognition"

git add -A
git commit -m "Initial commit: Speech Emotion Recognition - dark/light mode, Google Sign-In"
```

### Create repo on GitHub
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `speech-emotion-recognition`
3. **Do not** initialize with README (you already have one)
4. Create repository

### Push to GitHub
```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/speech-emotion-recognition.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username.

---

## 2. Clean Up Old Folder

The old folder `anti-gravity-voice-analyzer` could not be deleted because it’s in use (likely by uvicorn or another process).

**Do this after closing Cursor and any terminals:**

1. Close Cursor and all terminals.
2. Open PowerShell.
3. Run:
```powershell
cd "c:\Users\user\OneDrive\Attachments\New folder\speech-emotion-recognition"
.\CLEANUP_OLD_FOLDER.ps1
```

Or manually:
```powershell
Remove-Item -Path "c:\Users\user\OneDrive\Attachments\New folder\anti-gravity-voice-analyzer" -Recurse -Force
```

If it still fails, try:
- Restart your PC, then run the cleanup again.
- Or run PowerShell as Administrator.
