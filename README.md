# Mini Car Catalog

Catalog web app for mini cars with:

- React + TypeScript frontend
- Formik + Yup form validation
- Node.js + Express + MongoDB backend
- Image upload support
- Debounced autocomplete for car brands and models
- Docker Compose startup

## Run With Docker

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

## Main Features

- Create, list, edit, and delete mini car records
- Store `car brand`, `car model`, `car year`, `mini brand`, and `mini scale`
- Upload a photo for each record
- Switch between table and card views
- Filter, sort, and paginate the catalog
- Debounced autocomplete for:
  - car brand suggestions from existing records
  - car model suggestions filtered by the selected brand
