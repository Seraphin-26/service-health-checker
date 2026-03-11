# Service Health Checker

Check if any web service is up or down — in real time.

**Live demo → [service-health-checker.netlify.app](https://service-health-checker.netlify.app)**

---

## Stack

Next.js 14 · TypeScript · Tailwind CSS · Docker · GitHub Actions

## Features

- `GET /api/check?url=` — REST endpoint that returns status + latency
- 11 unit tests with Vitest
- Multi-stage Docker image (~150MB)
- CI/CD : tests → build → push to Docker Hub on every commit

## Run locally

```bash
npm install && npm run dev
```

## Test

```bash
npm test
```

---

Built by [nariveloson](https://github.com/nariveloson)
