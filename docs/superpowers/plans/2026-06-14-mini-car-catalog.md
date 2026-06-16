# Mini Car Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Dockerized full-stack catalog app for mini cars with CRUD, image uploads, advanced list filtering/sorting/pagination, and debounced autocomplete for car brand and model.

**Architecture:** Create a monorepo-style project with separate `frontend` and `backend` applications plus MongoDB via Docker Compose. The backend will expose a REST API with image upload support and distinct autocomplete endpoints backed by MongoDB indexes. The frontend will use React, TypeScript, Formik, and Yup to manage a create/edit workflow and two catalog list views with debounced suggestion fetching.

**Tech Stack:** React, TypeScript, Vite, Formik, Yup, Express, Node.js, TypeScript, MongoDB, Mongoose, Multer, Jest, React Testing Library, Supertest, Docker, Docker Compose

---

## File Structure

- `frontend/`
  - Vite React app with components, pages, hooks, API helpers, and RTL tests
- `backend/`
  - Express API with models, routes, controllers, services, middleware, uploads support, and API tests
- `docker-compose.yml`
  - Local development orchestration for frontend, backend, and MongoDB
- `README.md`
  - Setup and run instructions

### Task 1: Scaffold Project Layout

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/test/setup.ts`
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/jest.config.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/test/setup.ts`
- Create: `docker-compose.yml`
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Write the failing scaffold smoke tests**

```ts
// backend/src/app.test.ts
import request from 'supertest';
import { app } from './app';

describe('app bootstrap', () => {
  it('responds to health checks', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

```tsx
// frontend/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the catalog heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /mini car catalog/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --runInBand src/app.test.ts` in `backend`
Expected: FAIL because `app` and route do not exist

Run: `npm test -- App.test.tsx` in `frontend`
Expected: FAIL because the app scaffold does not exist

- [ ] **Step 3: Write the minimal scaffold**

```ts
// backend/src/app.ts
import express from 'express';

export const app = express();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
```

```tsx
// frontend/src/App.tsx
export default function App() {
  return <h1>Mini Car Catalog</h1>;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --runInBand src/app.test.ts` in `backend`
Expected: PASS

Run: `npm test -- App.test.tsx` in `frontend`
Expected: PASS

### Task 2: Implement Backend Mini Car CRUD and Validation

**Files:**
- Create: `backend/src/models/miniCar.ts`
- Create: `backend/src/routes/miniCars.ts`
- Create: `backend/src/controllers/miniCars.ts`
- Create: `backend/src/services/miniCars.ts`
- Create: `backend/src/validators/miniCar.ts`
- Create: `backend/src/types/miniCar.ts`
- Test: `backend/src/routes/miniCars.test.ts`

- [ ] **Step 1: Write failing API tests for create/list/get/update/delete**

```ts
it('creates a mini car record', async () => {
  const response = await request(app)
    .post('/api/minicars')
    .field('carBrand', 'Ford')
    .field('carModel', 'Mustang')
    .field('carYear', '1967')
    .field('miniBrand', 'Hot Wheels')
    .field('miniScale', '1:64')
    .attach('photo', fixturePath);

  expect(response.status).toBe(201);
  expect(response.body.item.carBrand).toBe('Ford');
});
```

- [ ] **Step 2: Run the backend API test to verify it fails**

Run: `npm test -- --runInBand src/routes/miniCars.test.ts` in `backend`
Expected: FAIL with missing route or handlers

- [ ] **Step 3: Implement the model, validation, controller, service, and routes**

```ts
const miniCarSchema = new Schema(
  {
    carBrand: { type: String, required: true, trim: true },
    carModel: { type: String, required: true, trim: true },
    carYear: { type: Number, required: true },
    miniBrand: { type: String, required: true, trim: true },
    miniScale: { type: String, required: true, trim: true },
    photoPath: { type: String, required: true },
    photoOriginalName: { type: String, required: true },
  },
  { timestamps: true }
);
```

- [ ] **Step 4: Run the backend API test to verify it passes**

Run: `npm test -- --runInBand src/routes/miniCars.test.ts` in `backend`
Expected: PASS

### Task 3: Implement Upload Handling and Static File Serving

**Files:**
- Create: `backend/src/middleware/upload.ts`
- Create: `backend/src/utils/files.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/src/routes/uploads.test.ts`

- [ ] **Step 1: Write failing tests for invalid file type, oversized file, and static upload access**

```ts
it('rejects unsupported image types', async () => {
  const response = await request(app)
    .post('/api/minicars')
    .field('carBrand', 'Ford')
    .attach('photo', badFixturePath);

  expect(response.status).toBe(400);
  expect(response.body.error.message).toMatch(/image/i);
});
```

- [ ] **Step 2: Run the upload test to verify it fails**

Run: `npm test -- --runInBand src/routes/uploads.test.ts` in `backend`
Expected: FAIL because upload filtering is not implemented

- [ ] **Step 3: Implement Multer configuration and static file serving**

```ts
export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
```

- [ ] **Step 4: Run the upload test to verify it passes**

Run: `npm test -- --runInBand src/routes/uploads.test.ts` in `backend`
Expected: PASS

### Task 4: Implement Backend Search, Sorting, Pagination, and Autocomplete

**Files:**
- Modify: `backend/src/services/miniCars.ts`
- Modify: `backend/src/controllers/miniCars.ts`
- Modify: `backend/src/routes/miniCars.ts`
- Test: `backend/src/routes/search.test.ts`

- [ ] **Step 1: Write failing tests for filtered list queries and autocomplete**

```ts
it('returns distinct brand suggestions matching the query', async () => {
  const response = await request(app).get('/api/autocomplete/brands?q=fo');
  expect(response.status).toBe(200);
  expect(response.body.items).toEqual(['Ford']);
});

it('filters model suggestions by brand', async () => {
  const response = await request(app).get('/api/autocomplete/models?q=mu&brand=Ford');
  expect(response.status).toBe(200);
  expect(response.body.items).toEqual(['Mustang']);
});
```

- [ ] **Step 2: Run the search test to verify it fails**

Run: `npm test -- --runInBand src/routes/search.test.ts` in `backend`
Expected: FAIL because autocomplete routes and filtered list logic do not exist

- [ ] **Step 3: Implement query parsing and autocomplete routes**

```ts
const brands = await MiniCar.distinct('carBrand', {
  carBrand: { $regex: escapeRegex(query), $options: 'i' },
});

const models = await MiniCar.distinct('carModel', {
  carBrand: exactBrand,
  carModel: { $regex: escapeRegex(query), $options: 'i' },
});
```

- [ ] **Step 4: Run the search test to verify it passes**

Run: `npm test -- --runInBand src/routes/search.test.ts` in `backend`
Expected: PASS

### Task 5: Build Frontend Data Layer and Catalog Views

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/miniCars.ts`
- Create: `frontend/src/components/CatalogToolbar.tsx`
- Create: `frontend/src/components/MiniCarTable.tsx`
- Create: `frontend/src/components/MiniCarCards.tsx`
- Create: `frontend/src/components/ViewToggle.tsx`
- Create: `frontend/src/hooks/useMiniCars.ts`
- Create: `frontend/src/types/miniCar.ts`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/App.test.tsx`

- [ ] **Step 1: Write failing frontend tests for list rendering and view switching**

```tsx
it('toggles between table and card views', async () => {
  render(<App />);
  expect(screen.getByRole('table')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /cards/i }));
  expect(screen.getByText(/viewing as cards/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the frontend catalog test to verify it fails**

Run: `npm test -- App.test.tsx` in `frontend`
Expected: FAIL because the list UI does not exist

- [ ] **Step 3: Implement the API helpers, hook, and dual catalog views**

```tsx
const [view, setView] = useState<'table' | 'cards'>('table');

return (
  <>
    <CatalogToolbar ... />
    <ViewToggle value={view} onChange={setView} />
    {view === 'table' ? <MiniCarTable items={items} /> : <MiniCarCards items={items} />}
  </>
);
```

- [ ] **Step 4: Run the frontend catalog test to verify it passes**

Run: `npm test -- App.test.tsx` in `frontend`
Expected: PASS

### Task 6: Build Formik/Yup Create/Edit Form With Image Upload

**Files:**
- Create: `frontend/src/components/MiniCarForm.tsx`
- Create: `frontend/src/validation/miniCarSchema.ts`
- Create: `frontend/src/components/ImageInput.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/components/MiniCarForm.test.tsx`

- [ ] **Step 1: Write failing form tests for validation and submit payload**

```tsx
it('shows validation errors for missing required fields', async () => {
  render(<MiniCarForm onSubmit={onSubmit} />);
  await user.click(screen.getByRole('button', { name: /save/i }));
  expect(screen.getByText(/car brand is required/i)).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the form test to verify it fails**

Run: `npm test -- MiniCarForm.test.tsx` in `frontend`
Expected: FAIL because the form component and schema do not exist

- [ ] **Step 3: Implement the Formik form, Yup schema, and multipart submission**

```tsx
const validationSchema = object({
  carBrand: string().trim().required('Car brand is required'),
  carModel: string().trim().required('Car model is required'),
  carYear: number().integer().min(1900).max(currentYear).required(),
  miniBrand: string().trim().required('Mini brand is required'),
  miniScale: string().matches(/^\d+:\d+$/, 'Scale must use the format 1:64').required(),
});
```

- [ ] **Step 4: Run the form test to verify it passes**

Run: `npm test -- MiniCarForm.test.tsx` in `frontend`
Expected: PASS

### Task 7: Add Debounced Brand/Model Autocomplete

**Files:**
- Create: `frontend/src/components/AutocompleteInput.tsx`
- Create: `frontend/src/hooks/useDebouncedValue.ts`
- Modify: `frontend/src/components/MiniCarForm.tsx`
- Modify: `frontend/src/api/miniCars.ts`
- Test: `frontend/src/components/AutocompleteInput.test.tsx`

- [ ] **Step 1: Write failing autocomplete tests for debounce and brand/model dependency**

```tsx
it('waits before requesting suggestions', async () => {
  jest.useFakeTimers();
  render(<AutocompleteInput ... />);
  await user.type(screen.getByRole('textbox', { name: /car brand/i }), 'Fo');
  expect(fetchSuggestions).not.toHaveBeenCalled();
  jest.advanceTimersByTime(300);
  expect(fetchSuggestions).toHaveBeenCalledWith('Fo');
});
```

```tsx
it('clears the current model when the brand changes', async () => {
  render(<MiniCarForm initialValues={initialValues} ... />);
  await user.clear(screen.getByLabelText(/car brand/i));
  await user.type(screen.getByLabelText(/car brand/i), 'Chevrolet');
  expect(screen.getByLabelText(/car model/i)).toHaveValue('');
});
```

- [ ] **Step 2: Run the autocomplete test to verify it fails**

Run: `npm test -- AutocompleteInput.test.tsx` in `frontend`
Expected: FAIL because debounce logic and dependency behavior do not exist

- [ ] **Step 3: Implement debounced fetching with stale-response protection**

```tsx
const debouncedQuery = useDebouncedValue(query, 300);
const requestId = useRef(0);

useEffect(() => {
  const nextRequestId = ++requestId.current;
  void fetchSuggestions(debouncedQuery).then((items) => {
    if (nextRequestId !== requestId.current) return;
    setOptions(items);
  });
}, [debouncedQuery, fetchSuggestions]);
```

- [ ] **Step 4: Run the autocomplete test to verify it passes**

Run: `npm test -- AutocompleteInput.test.tsx` in `frontend`
Expected: PASS

### Task 8: Final Docker and End-to-End Project Verification

**Files:**
- Create: `frontend/Dockerfile`
- Create: `backend/Dockerfile`
- Modify: `docker-compose.yml`
- Modify: `README.md`

- [ ] **Step 1: Write failing verification expectations**

```bash
docker compose config
npm test -- --runInBand
npm test
```

- [ ] **Step 2: Run the verification commands to find failures**

Run: `docker compose config` at project root
Expected: FAIL until compose references valid build contexts and env vars

- [ ] **Step 3: Implement Dockerfiles, compose services, env defaults, and docs**

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  backend:
    build: ./backend
    ports:
      - "5000:5000"
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
```

- [ ] **Step 4: Run the verification commands to confirm the project works**

Run: `docker compose config` at project root
Expected: PASS

Run: `npm test -- --runInBand` in `backend`
Expected: PASS

Run: `npm test` in `frontend`
Expected: PASS
