# LinkedIn Access Token Module Design

## Purpose

Create a new admin module in `horizon-ui-chakra` for LinkedIn token management.

This module will help admin users:

1. Generate the LinkedIn authorization URL
2. Copy or open that URL in a new tab
3. Get the LinkedIn `code` from the callback flow
4. Paste the `code` into the admin panel
5. Generate and save the access token into the backend database
6. View current token details including expiry date

This document is for design and flow approval only.
No implementation is included yet.

## Module Placement

Add a new sidebar category/module in `horizon-ui-chakra/src/routes.js`.

Recommended sidebar structure:

- Category: `Marketing`
- Parent/Item: `LinkedIn`
- Child/Page: `Access Token`

Recommended route:

- Layout: `/admin`
- Path: `/linkedin/access-token`

Recommended frontend files:

- `src/views/admin/linkedinAccessToken/index.jsx`
- `src/views/admin/linkedinAccessToken/LinkedInAccessToken.jsx`

## User Flow

### Phase 1: Generate Authorization URL

Frontend calls:

- `GET /api/admin/linkedin/authorize`

Expected response:

```json
{
  "success": true,
  "url": "https://www.linkedin.com/oauth/v2/authorization?...",
  "state": "random_state_value"
}
```

UI should:

1. Show a button: `Generate Authorization URL`
2. Show the returned URL in a read-only field or box
3. Show a `Copy URL` button
4. Show an `Open URL` button
5. Open URL in new tab if user clicks

### Phase 2: Paste Code and Save Token

After user authorizes LinkedIn in the new tab, LinkedIn redirects to:

- `GET /api/admin/linkedin/callback`

User copies the `code` from callback page and pastes it into the admin panel.

Frontend then calls:

- `POST /api/admin/linkedin/generate-tokens`

Request body:

```json
{
  "code": "linkedin_authorization_code"
}
```

Expected UI result:

1. Success message
2. Token saved confirmation
3. Current token summary section refreshed

## Future Backend Data Changes

Current `Token` model already stores:

- `category`
- `access_token`
- `refresh_token`

Planned addition:

- `expires_at`

Reason:

LinkedIn token response returns `expires_in`, and admin wants to see actual expiry date.

Planned backend work later:

1. Add `expires_at` column to `Token` model
2. Create new migration file with current timestamp name
3. Save calculated expiry datetime during token generation
4. Expose token details to frontend

Recommended calculation:

- `expires_at = now + expires_in seconds`

## Recommended API Set For This Module

### Already Present

- `GET /api/admin/linkedin/authorize`
- `POST /api/admin/linkedin/generate-tokens`
- `POST /api/admin/linkedin/clear-tokens`

### Recommended Additional API For UI

Add a token summary endpoint later:

- `GET /api/admin/linkedin/token-details`

Recommended response:

```json
{
  "success": true,
  "data": {
    "category": "linkedin",
    "access_token_masked": "AQXx....abcd",
    "refresh_token_masked": null,
    "expires_at": "2026-05-11T10:00:00.000Z",
    "is_expired": false,
    "updated_at": "2026-03-14T10:00:00.000Z"
  }
}
```

## Screen Layout Proposal

Single page design:

1. Page header
2. Authorization URL generation card
3. Code input and save card
4. Current token details card

## ASCII UI Wireframe

```text
+----------------------------------------------------------------------------------+
| LinkedIn                                                                         |
| Access Token                                                                     |
| Manage LinkedIn authorization URL, token generation, and token status.           |
+----------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------+
| Step 1: Generate Authorization URL                                               |
|----------------------------------------------------------------------------------|
| [ Generate Authorization URL ]                                                   |
|                                                                                  |
| Authorization URL                                                                |
| +------------------------------------------------------------------------------+ |
| | https://www.linkedin.com/oauth/v2/authorization?response_type=code&...      | |
| +------------------------------------------------------------------------------+ |
|                                                                                  |
| [ Copy URL ]   [ Open URL In New Tab ]                                          |
+----------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------+
| Step 2: Paste LinkedIn Code                                                      |
|----------------------------------------------------------------------------------|
| Authorization Code                                                               |
| +------------------------------------------------------------------------------+ |
| | Paste code here...                                                           | |
| +------------------------------------------------------------------------------+ |
|                                                                                  |
| [ Generate Token And Save ]   [ Clear Token ]                                    |
+----------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------+
| Current Token Details                                                            |
|----------------------------------------------------------------------------------|
| Category          : linkedin                                                     |
| Access Token      : AQXx....abcd                                                 |
| Refresh Token     : Not available                                                |
| Expiry Date       : 2026-05-11 03:30 PM                                          |
| Status            : Active                                                       |
| Last Updated      : 2026-03-14 10:30 AM                                          |
+----------------------------------------------------------------------------------+
```

## UI Behavior Details

### Generate Authorization URL Button

On click:

1. Show loading spinner
2. Call `GET /api/admin/linkedin/authorize`
3. Save returned `url` and `state` in page state
4. Render URL box

### Copy URL Button

On click:

1. Copy URL to clipboard
2. Show success toast: `URL copied successfully`

### Open URL Button

On click:

1. Open returned URL in new browser tab

### Generate Token And Save Button

On click:

1. Validate code is not empty
2. Call `POST /api/admin/linkedin/generate-tokens`
3. Show success or error toast
4. Refresh token detail section

### Clear Token Button

On click:

1. Show confirmation modal
2. Call `POST /api/admin/linkedin/clear-tokens`
3. Clear token detail UI

## Suggested Frontend State

Recommended state variables:

```js
const [authUrl, setAuthUrl] = useState('');
const [authState, setAuthState] = useState('');
const [authCode, setAuthCode] = useState('');
const [tokenDetails, setTokenDetails] = useState(null);
const [loadingUrl, setLoadingUrl] = useState(false);
const [savingToken, setSavingToken] = useState(false);
const [loadingTokenDetails, setLoadingTokenDetails] = useState(false);
```

## Suggested Component Structure

Recommended page split:

### `LinkedInAccessToken.jsx`

Main page container.

Responsibilities:

- Page title
- API state handling
- Render cards/sections

### Optional child cards

- `AuthorizationUrlCard`
- `TokenCodeCard`
- `TokenDetailsCard`

For first version, one single component is enough.

## Suggested Visual Style

User requested a black page.

Recommended style direction:

- Page/card background: dark
- Inputs: dark with light text
- Buttons:
  - primary: blue
  - secondary: gray
  - destructive: red for clear token

Suggested sections:

- Header with LinkedIn branding text
- Clear 3-step process
- Big full-width URL/code boxes for easy copy/paste

## Integration Plan

### Frontend

Update `horizon-ui-chakra/src/routes.js`:

1. Import new page component
2. Add a new route under `Marketing`

### Backend

Use existing APIs first:

- `GET /api/admin/linkedin/authorize`
- `POST /api/admin/linkedin/generate-tokens`
- `POST /api/admin/linkedin/clear-tokens`

Add later:

- `GET /api/admin/linkedin/token-details`

### Database

Later change:

1. Add `expires_at` to `Token` model
2. Add migration with current timestamp prefix

## Validation Rules

### URL generation

- If backend fails, show error message

### Code input

- Required field
- Trim whitespace before sending

### Token details

- If no token exists, show:
  - `No LinkedIn token saved yet`

## Recommended Implementation Order

### Step 1

Frontend page and sidebar route

### Step 2

Authorization URL UI integration

### Step 3

Code input + generate token integration

### Step 4

Token details backend endpoint

### Step 5

`expires_at` DB column + migration + UI display

## Questions To Confirm Before Implementation

1. Should `LinkedIn -> Access Token` be under `Marketing`, or do you want a separate sidebar category?
2. Should the page be a full dark theme card page, or match the normal existing admin page style with only one dark card?
3. Should token details show full token, or masked token only?
4. Should the code input stay visible after save, or be cleared automatically?
5. Should we add `GET /api/admin/linkedin/token-details` in the same implementation phase, or only after the basic page is ready?
