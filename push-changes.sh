#!/bin/bash

echo "=== Pushing changes to both repositories ==="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: Not in a git repository"
  exit 1
fi

# Add all changes
echo "1. Adding changes..."
git add .

# Commit changes
echo "2. Committing changes..."
git commit -m "Fix admin panel API endpoints

- Remove duplicate function definitions
- Add getSupabaseClient() to all handlers
- Fix 404 errors for admin endpoints
- Clean up API file structure"

# Check if commit was successful
if [ $? -ne 0 ]; then
  echo "Warning: Commit failed or no changes to commit"
  echo "Continuing with push anyway..."
fi

# Push to origin/main
echo "3. Pushing to origin/main..."
git push origin main

if [ $? -ne 0 ]; then
  echo "Error: Failed to push to origin/main"
  exit 1
fi

# Check if repo2 remote exists
echo "4. Checking for repo2 remote..."
if git remote | grep -q repo2; then
  echo "   Found repo2 remote, pushing to repo2/main..."
  git push repo2 main
  if [ $? -ne 0 ]; then
    echo "Warning: Failed to push to repo2/main"
    echo "Continuing..."
  fi
else
  echo "   repo2 remote not found, skipping..."
fi

echo "=== Push completed successfully ==="
echo ""
echo "Changes pushed:"
echo "- Fixed duplicate function definitions in api/index.js"
echo "- Added getSupabaseClient() to all handlers"
echo "- Admin endpoints should now work:"
echo "  • /api/admin/stats"
echo "  • /api/admin/bookings"
echo "  • /api/admin/contacts"
echo "  • /api/admin/posts"