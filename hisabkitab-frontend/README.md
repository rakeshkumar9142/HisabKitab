# HisabKitab Frontend

Mobile-friendly POS frontend for the HisabKitab backend.

## Tech Stack

- React + Vite
- React Router
- Axios
- Tailwind CSS

## Features

- Auth flow: register, login, token persistence in localStorage
- Protected dashboard with bottom navigation
- Item CRUD (add/list/edit/delete)
- Billing screen with multi-item bill generation and receipt preview
- Bills history list
- Device registration/list/disable
- Subscription status check + renew

## Folder Structure

```text
src/
  components/
  context/
  pages/
  services/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file in `hisabkitab-frontend`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

3. Run development server:

```bash
npm run dev
```

4. Build production bundle:

```bash
npm run build
```

## Backend API Used

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/items`
- `GET /api/items`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`
- `POST /api/bills`
- `GET /api/bills`
- `POST /api/devices`
- `GET /api/devices`
- `DELETE /api/devices/:id`
- `POST /api/shop/renew`
