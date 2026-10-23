# LeetCode Profile Dashboard

## Requirements
- Node.js 18 or newer
- Internet connection

## Run locally
```bash
cd leetcode-dashboard
npm install
npm start
```

Open http://localhost:3000 in your browser and enter a LeetCode username.

## Notes
- Uses LeetCode's public GraphQL data through a local Express proxy, avoiding browser CORS restrictions.
- No LeetCode password, session cookie, or login is needed.
- Only publicly available profile, aggregate problem statistics, topic counts, and contest history are shown.
- Hidden submissions, source code, and private calendar data are not fetched.
