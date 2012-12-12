git filter-branch --index-filter 'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all