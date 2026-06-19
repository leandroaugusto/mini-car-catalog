# Mini Car Catalog

Catalog web app for mini cars with:

- React + TypeScript frontend
- Formik + Yup form validation
- Node.js + Express + MongoDB backend
- Image upload support
- Debounced autocomplete for car brands and models
- Docker Compose startup

## Run With Docker

Set these backend environment variables before starting if you want image uploads to go to Cloudflare R2:

```bash
export R2_ACCOUNT_ID=your-account-id
export R2_ACCESS_KEY_ID=your-access-key-id
export R2_SECRET_ACCESS_KEY=your-secret-access-key
export R2_BUCKET_NAME=mini-car-catalog-bucket
export R2_PUBLIC_BASE_URL=https://your-public-r2-domain
```

Then start the stack:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`
- MongoDB: `mongodb://localhost:27017`

## Run Tests

```bash
cd backend && npm test
cd frontend && npm test
```

## Migrate Existing Local Uploads To R2

If you already have images stored in the old local uploads directory, migrate them with:

```bash
cd backend
npm run migrate:photos:r2
```

To recompress images that are already stored in R2 without changing their keys:

```bash
cd backend
npm run optimize:photos:r2
```

## Main Features

- Create, list, edit, and delete mini car records
- Store `car brand`, `car model`, `car year`, `mini brand`, and `mini scale`
- Upload a photo for each record
- Switch between table and card views
- Filter, sort, and paginate the catalog
- Debounced autocomplete for:
  - car brand suggestions from existing records
  - car model suggestions filtered by the selected brand
