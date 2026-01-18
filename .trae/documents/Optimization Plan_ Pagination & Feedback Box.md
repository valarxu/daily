I will optimize the project by implementing pagination and improving the feedback box interaction.

### 1. Backend: Implement Pagination API

* **File:** `backend/src/routes/cards.ts`

* **Change:** Modify `GET /` to accept `page` (default 1) and `limit` (default 7) query parameters.

* **Logic:** Use `skip` and `limit` to fetch a subset of cards.

* **Response:** Change response format from `Card[]` to `{ cards: Card[], total: number, totalPages: number, currentPage: number }`.

### 2. Frontend: Update Store for Pagination

* **File:** `frontend/src/store/useStore.ts`

* **Change:**

  * Update `fetchCards` to accept `page` and `limit`.

  * Update state interface to include pagination metadata (`totalPages`, `currentPage`).

  * Handle the new response format from the API.

### 3. Frontend: Add Pagination UI

* **File:** `frontend/src/pages/Home.tsx`

* **Change:**

  * Add state for `currentPage`.

  * Pass `currentPage` to `fetchCards`.

  * Add "Previous" and "Next" buttons at the bottom of the card list to navigate between pages.

### 4. Frontend: Optimize Feedback Box Interaction

* **File:** `frontend/src/components/Card/Card.tsx`

* **Change:**

  * Remove the `triggerUpdate` (debounce) logic for the "Daily Reflection" input.

  * Update `handleReflectionChange` to only update local state.

  * Modify the "Complete" (Check icon) button to send the current reflection content when marking the card as complete.

