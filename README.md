# Service Health Checker

Check if any web service is up or down — in real time.

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://service-health-checker.netlify.app)


![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38B2AC?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## Description
Service Health Checker est une application web qui vérifie l'état de vos services en ligne et fournit un retour visuel rapide. Développée avec Next.js et Tailwind CSS, elle offre une interface réactive et moderne.

## Screenshots

### Desktop View
<img src="screenshots/desktop.png" width="500px" alt="Desktop view" />
<img src="screenshots/desktop_1.png" width="500px" alt="Desktop view" />

### Mobile View
<img src="screenshots/mobile.png" width="250px" alt="Mobile view" />
<img src="screenshots/mobile_1.png" width="250px" alt="Mobile view" />


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
