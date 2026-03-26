# Category / SubCategory / Technology CRUD Management Plan

## 1. Goal & UI Structure
1. Create a new admin page module (main module) that uses `Tabs` to host 3 sub-modules: `Category`, `Sub Category`, `Technologies`.
2. Each sub-module must render:
   1. A search input (per module)
   2. A table listing all records (with columns relevant to the entity)
   3. Pagination controls with “per page” selector (match the UX pattern from `FreelancerList.jsx`)
   4. Add, Update, Delete actions (consistent UI for all 3 modules)
3. Use the same table/pagination behavior pattern across modules:
   1. Maintain `page` and `pageLimit` in state
   2. Show `Showing X of Y` + page buttons (limited to first ~10 pages)
   3. Changing `per page` resets `page` to `1`
   4. Changing `search` resets `page` to `1`
4. For Add/Update, use a modal form (or inline editing) with validation before submit.

## 2. Backend API Design (to add in `admin.route.js`)
### API count
1. Add **12 new APIs** under `halogig-internal-backend/src/routes/admin.route.js` to support full CRUD + search + pagination for all 3 models (without breaking existing list endpoints).

### Proposed endpoints to add (12)
1. Category
   1. `GET /admin/category-management/categories?page=&limit=&search=` (list + search + pagination; returns `total_count` and paginated rows)
   2. `POST /admin/category-management/categories` (create; checks if category already exists before insert)
   3. `PUT /admin/category-management/categories/:id` (update; checks duplicates excluding current record)
   4. `DELETE /admin/category-management/categories/:id` (delete; relies on cascade to subcategories)
2. Sub Category
   1. `GET /admin/category-management/sub-categories?page=&limit=&search=` (list + search + pagination; include `category_name` in rows for table display)
   2. `POST /admin/category-management/sub-categories` (create; validates `categoryId` exists; checks duplicate subcategory before insert)
   3. `PUT /admin/category-management/sub-categories/:id` (update; validates `categoryId` exists; checks duplicates excluding current record)
   4. `DELETE /admin/category-management/sub-categories/:id` (delete)
3. Technologies
   1. `GET /admin/category-management/technologies?page=&limit=&search=` (list + search + pagination)
   2. `POST /admin/category-management/technologies` (create; checks duplicates before insert)
   3. `PUT /admin/category-management/technologies/:id` (update; checks duplicates excluding current record)
   4. `DELETE /admin/category-management/technologies/:id` (delete)

### Existing routes impact (important)
1. Keep existing routes (`/admin/categories`, `/admin/sub-categories/:categoryId/information`) as-is for backward compatibility with current screens.
2. The new admin management module should call only the new `category-management/*` endpoints.

## 3. Backend Implementation Plan (Controller + Repository)
1. Add new controller methods in `halogig-internal-backend/src/controllers/admin.controller.js` for each of the 12 endpoints.
2. Add corresponding repository methods in `halogig-internal-backend/src/repositories/admin.repository.js`:
   1. List methods use `findAndCountAll` (or equivalent) with `limit/offset` and `where` clauses for `search`
   2. Duplicate checks:
      1. Normalize input before checks (trim whitespace; decide case-insensitive matching using Sequelize functions)
      2. Category duplicates: detect by normalized `name`
      3. SubCategory duplicates: detect by `categoryId + normalized name` (to avoid identical subcategories under the same category)
      4. Technology duplicates: detect by normalized `name`
   3. Create/update should return a consistent response object and status for:
      1. Validation failures (missing required fields)
      2. Not found (invalid `id` or invalid `categoryId` for subcategory)
      3. Duplicate conflicts (attempt to create/update to an already-existing record)
3. Delete behavior:
   1. Deleting a category should cascade-delete subcategories (as currently defined in the Sequelize association)
   2. Deleting a subcategory should not affect other categories
   3. Deleting a technology should be independent

## 4. Frontend Implementation Plan (Redux/Service + Pages)
1. Create a new page entry in `horizon-ui-chakra/src/views/admin/` for the main module (tabs).
2. Create 3 sub-components:
   1. `CategoriesModule` (table + search + add/edit/delete)
   2. `SubCategoriesModule` (table + search + add/edit/delete; include category selector dropdown for forms)
   3. `TechnologiesModule` (table + search + add/edit/delete)
3. Implement state + fetching pattern similar to `FreelancerList.jsx`:
   1. `page`, `pageLimit`, `searchTerm`, `totalCount`, `rows`, `isLoading`
   2. On mount / whenever `page/pageLimit/searchTerm` changes: fetch paginated data
4. Implement API integration (Redux optional, but recommended for consistency):
   1. Create async thunks for list/create/update/delete for each module (or reuse a shared API helper and keep local state if simpler)
   2. After create/update/delete: refetch the current list (or clamp page if it becomes invalid)
5. UI/UX edge cases:
   1. Show empty state when `total_count === 0`
   2. If delete/update succeeds but the current `page` becomes out of range, refetch with a clamped page (e.g., max valid page)
   3. Disable submit buttons while loading; disable execute actions while requests are pending
   4. Show user-friendly error messages for duplicates and validation failures

## 5. Edge Cases Checklist (must be covered)
1. Duplicate prevention:
   1. Category create/update: same name (case/whitespace normalized) should be blocked
   2. SubCategory create/update: same `(categoryId, name)` should be blocked
   3. Technology create/update: same name should be blocked
2. Subcategory relationship integrity:
   1. Creating/updating subcategory must fail if `categoryId` does not exist
3. Search + pagination correctness:
   1. Changing `search` resets `page` to `1`
   2. `per page` change resets `page` to `1`
   3. Pagination controls must reflect `total_count` returned by backend
4. Delete safety:
   1. Deleting a category cascades subcategories without leaving orphan records
   2. After delete, UI must refresh and handle out-of-range pages gracefully

