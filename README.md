# Product Admin Dashboard

A responsive product administration dashboard built with **Next.js, React, TypeScript, Tailwind CSS, and Axios** using the [DummyJSON](https://dummyjson.com) API.

The application supports authentication, product listing, pagination, search, category filtering, sorting, product details, and simulated product CRUD operations.

## Live Demo

**Vercel:**
`https://product-admin-dashboard-sand.vercel.app/login`

## GitHub Repository

`https://github.com/MohamedFazil1406/Product-Admin-Dashboard`

---

## Implementation Note

### Technical Choices

I used **Next.js with TypeScript and Tailwind CSS** for the frontend and **Axios** for all API communication. I separated API logic into service files and used one shared Axios instance for base configuration, authentication token handling, and common request behavior.

For the product list, I kept pagination, search, category, and sorting values in the URL so the page state remains consistent after refresh and can be shared through a link.

Because DummyJSON does not persist add, edit, and delete operations, I used `localStorage` as a small client-side persistence layer to keep those changes visible in the application.

### Problem I Faced

One issue I faced was a race condition during product search. If a user typed quickly, an older API request could finish after a newer request and replace the latest search results.

I fixed this by adding a debounce to the search input and using `AbortController` to cancel the previous Axios request whenever the search query changed.

### AI Usage

I used AI as a development assistant for reviewing code structure, debugging issues, discussing edge cases, and improving documentation.

I reviewed and understood the suggested code before using it. I can explain the implementation, architecture, and design decisions and make changes to the application during the technical discussion.


## Features

### Authentication

- Login using DummyJSON authentication API
- Protected product routes
- Authentication token stored in localStorage
- Token automatically added to Axios requests
- Logout functionality
- Prevents duplicate login requests

Test credentials:

```text
Username: emilys
Password: emilyspass
```

### Product Listing

Displays:

- Product image
- Title
- Category
- Price
- Rating
- Stock

Desktop devices use a table layout.

Mobile devices use responsive product cards.

### Pagination

Server-side pagination using DummyJSON `limit` and `skip`.

Supported page sizes:

```text
10
20
50
```

Pagination includes:

- Previous button
- Next button
- Page numbers
- Current result range
- Total product count

Example:

```text
Showing 21–40 of 194
```

### Search

Products can be searched using:

```text
/products/search?q=
```

Search includes:

- 500ms debounce
- Page reset to page 1
- URL synchronization
- AbortController request cancellation
- Protection against stale search responses

Example:

```text
/products?page=1&limit=10&search=phone
```

### Category Filtering

Products can be filtered by category.

Example:

```text
/products?page=1&limit=10&category=beauty
```

DummyJSON does not support category filtering and search in the same API request.

To keep behavior predictable:

- Starting a search clears the selected category.
- Selecting a category clears the current search.

### Sorting

Products can be sorted by:

- Title
- Price
- Rating

Both ascending and descending order are supported.

Example:

```text
/products?page=1&limit=10&sort=price&order=desc
```

### URL State

The following values are stored in the URL:

```text
page
limit
search
category
sort
order
```

This allows the page state to survive refreshes and makes filtered URLs shareable.

Example:

```text
/products?page=2&limit=20&sort=price&order=desc
```

Invalid URL values such as:

```text
?page=abc
```

fall back to safe defaults.

Pages beyond the available page count are redirected to the last valid page.

### Product Details

Dynamic product details page:

```text
/products/[id]
```

Displays:

- Images
- Title
- Description
- Category
- Price
- Rating
- Stock
- Reviews

Invalid product IDs display a product-not-found state.

### Add Product

Products can be created through:

```text
/products/add
```

The form validates:

- Title
- Description
- Category
- Price
- Stock

The Save button is disabled while the request is running to prevent duplicate submissions.

### Edit Product

Existing products can be edited using:

```text
/products/[id]/edit
```

Edited values are stored locally because DummyJSON does not permanently save updates.

### Delete Product

Products can be deleted from the product details page.

A confirmation dialog is displayed before deletion.

Deleted product IDs are stored locally so deleted products remain hidden from the UI.

---

## DummyJSON CRUD Limitation

DummyJSON simulates create, update, and delete requests but does not permanently save those changes.

To handle this, the application uses a small local persistence layer built with `localStorage`.

The API remains the original source of product data while local changes are applied before rendering.

The application stores:

```text
addedProducts
editedProducts
deletedProductIds
```

The rendering flow is:

```text
DummyJSON products
        +
Local added products
        +
Local edits
        -
Local deleted products
        ↓
Final UI
```

This allows CRUD functionality to behave realistically during the assessment without requiring a separate backend.

---

## Project Structure

```text
src/
│
├── app/
│   ├── login/
│   │   └── page.tsx
│   │
│   └── products/
│       ├── layout.tsx
│       ├── page.tsx
│       │
│       ├── add/
│       │   └── page.tsx
│       │
│       └── [id]/
│           ├── page.tsx
│           └── edit/
│               └── page.tsx
│
├── components/
│   ├── Navbar.tsx
│   ├── Pagination.tsx
│   ├── ProductFilters.tsx
│   ├── ProductForm.tsx
│   └── SearchInput.tsx
│
├── lib/
│   ├── axios.ts
│   └── product-local-store.ts
│
├── services/
│   ├── auth.service.ts
│   └── product.service.ts
│
└── types/
    ├── auth.ts
    └── product.ts
```

---

## Architecture

API calls are kept separate from UI components.

```text
React Component
      ↓
Service Layer
      ↓
Shared Axios Instance
      ↓
DummyJSON API
```

For example:

```text
ProductsPage
      ↓
product.service.ts
      ↓
axios.ts
      ↓
DummyJSON
```

This keeps components focused on rendering and user interaction while API logic remains centralized.

---

## Axios Setup

The project uses a single shared Axios instance.

It is responsible for:

- Configuring the API base URL
- Adding the authentication token
- Centralizing request configuration
- Handling common API errors

This avoids repeating Axios configuration across components.

---

## Getting Started

### Prerequisites

Install:

```text
Node.js 20+
npm
Git
```

### Clone the project

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd product-admin-dashboard
```

### Install dependencies

```bash
npm install
```

### Environment Variables

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=https://dummyjson.com
```

### Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Login

Use:

```text
Username: emilys
Password: emilyspass
```

After successful authentication the user is redirected to:

```text
/products
```

Product routes are protected.

Opening a product route without an authentication token redirects the user to:

```text
/login
```

---

## Important Technical Decisions

### URL as the Source of Truth

Pagination, search, filters, and sorting are stored in URL query parameters rather than only React state.

This provides:

- Refresh persistence
- Shareable URLs
- Browser navigation support
- Predictable state

### Debounced Search

Search waits 500ms after the user stops typing before updating the query.

This avoids unnecessary API calls.

### Preventing Search Race Conditions

An `AbortController` cancels the previous API request whenever the search query changes.

Without cancellation:

```text
Request A: phone
Request B: laptop

B finishes first → laptop displayed
A finishes later → phone incorrectly replaces laptop
```

With cancellation:

```text
Request A: phone
        ↓
query changes
        ↓
Request A cancelled
        ↓
Request B: laptop
        ↓
latest results displayed
```

### Search and Category Filtering

DummyJSON does not support search and category filtering together.

Instead of filtering only the current page on the client, the two modes are mutually exclusive.

This avoids displaying incomplete or misleading results.

### Local CRUD Persistence

Because DummyJSON does not persist mutations, localStorage is used as an overlay on top of API data.

This keeps the limitation isolated from the UI and makes the behavior easy to explain and maintain.

---

## Loading, Empty and Error States

The application handles:

### Loading

```text
Loading products...
```

### Empty search

```text
No products found for "search term".
```

### Errors

A Retry button is available when an API request fails.

### Invalid Product

Invalid product URLs display:

```text
404
Product not found
```

---

## Duplicate Request Prevention

Login and product forms prevent repeated submissions while an API request is running.

Example:

```text
Click Save
    ↓
saving = true
    ↓
button disabled
    ↓
API request
    ↓
saving = false
```

This prevents multiple API calls when a user clicks the same button repeatedly.

---

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- DummyJSON API
- localStorage
- Vercel

---

## What I Completed

- [x] Login
- [x] Protected routes
- [x] Logout
- [x] Shared Axios instance
- [x] Authentication token interceptor
- [x] Product listing
- [x] Desktop table
- [x] Mobile product cards
- [x] Pagination
- [x] Page-size selection
- [x] Debounced search
- [x] Search race-condition handling
- [x] Category filtering
- [x] Product sorting
- [x] URL state
- [x] Invalid query parameter handling
- [x] Product details
- [x] Reviews
- [x] Product-not-found handling
- [x] Add product
- [x] Edit product
- [x] Delete product
- [x] Form validation
- [x] Delete confirmation
- [x] Duplicate-submit prevention
- [x] Loading state
- [x] Empty state
- [x] Error and Retry state
- [x] Local persistence for DummyJSON mutations

---

## Problem I Faced

One important issue was preventing old search responses from replacing newer search results.

For example, if a user searched for `phone` and quickly changed the search to `laptop`, the first request could potentially finish after the second request.

This could cause incorrect products to appear.

I solved this using `AbortController`.

Whenever the search parameters change, the previous request is cancelled before the new request is made.

---

## AI Usage

AI tools were used as a development assistant for:

- Reviewing component structure
- Discussing edge cases
- Debugging request cancellation
- Reviewing pagination and URL state logic
- Improving code organization
- Reviewing README documentation

I reviewed and understood the generated suggestions before integrating them into the project and can explain the implementation and design decisions.

---

## Future Improvements

Given more time, I would consider:

- Moving authentication from localStorage to secure HTTP-only cookies
- Adding unit and integration tests
- Adding toast notifications
- Improving accessibility
- Adding skeleton loading states
- Adding stronger form validation
- Using a real backend for persistent CRUD operations

---

## Author

**Mohamed Fazil**

Frontend Assignment — Product Admin Dashboard
