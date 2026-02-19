# Upload to GitHub

The repo is initialized and committed. To push to GitHub:

## Option 1: Create repo on GitHub, then push

1. **Create a new repository on GitHub**
   - Go to https://github.com/new
   - Repository name: `accessibility-audit` (or any name)
   - Do **not** initialize with README, .gitignore, or license (we already have them)
   - Click **Create repository**

2. **Add the remote and push** (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name):

   ```bash
   cd /Users/abhinit/Downloads/hackathon
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

   If you use SSH:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## Option 2: Using GitHub CLI (after installing)

```bash
brew install gh
gh auth login
cd /Users/abhinit/Downloads/hackathon
gh repo create accessibility-audit --public --source=. --remote=origin --push
```
