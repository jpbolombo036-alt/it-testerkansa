# Backend API Integration Specification
## For AI Backend Agent — Frontend Integration Status

> Base path: `/api`  
> Auth: JWT Bearer token (`Authorization: Bearer <token>`)  
> Content-Type: `application/json`

---

## Modules & Frontend API Calls

### 1. Bloc Notes (QA Notes)

**Frontend file:** `src/api/blocNoteApi.ts`

| Method | Path | Frontend Function | Description |
|--------|------|-------------------|-------------|
| GET | `/bloc-notes` | `fetchAllNotes()` | List notes (admin: all, user: own) |
| GET | `/bloc-notes/{id}` | `fetchNoteById(id)` | Get note by ID |
| POST | `/bloc-notes` | `createNote(data)` | Create note |
| PUT | `/bloc-notes/{id}` | `updateNote(id, data)` | Update note |
| DELETE | `/bloc-notes/{id}` | `deleteNote(id)` | Delete note |

**DTOs:**
```json
// BlocNoteDTO (response)
{
  "id": number,
  "title": string | null,
  "content": string,
  "applicationId": number | null,
  "sessionId": number | null,
  "testId": number | null,
  "status": string,
  "createdBy": number,
  "createdByUsername": string,
  "createdAt": string (ISO),
  "updatedAt": string (ISO)
}

// BlocNoteRequest (request body)
{
  "title": string | null,
  "content": string,
  "applicationId": number | null,
  "sessionId": number | null,
  "testId": number | null,
  "status": string
}
```

**Status values:** DRAFT, IN_PROGRESS, VALIDATED, REJECTED, ARCHIVED

**Rules:**
- `createdBy` is set from JWT `currentUser.id`
- Non-admin users only see their own notes
- Admin sees all notes
- User notes sorted by `updatedAt` DESC

---

### 2. Applications

**Frontend file:** `src/api/applicationApi.ts`

| Method | Path | Frontend Function |
|--------|------|-------------------|
| GET | `/applications` | `fetchApplications()` |
| GET | `/applications/{id}` | `fetchApplicationById(id)` |
| POST | `/applications` | `createApplication(data)` |
| PUT | `/applications/{id}` | `updateApplication(id, data)` |
| DELETE | `/applications/{id}` | `deleteApplication(id)` |

**DTOs:**
```json
// Application (response)
{
  "id": number,
  "nom": string,
  "description": string,
  "version": string,
  "environnement": string,  // "DEVELOPPEMENT" | "STAGING" | "PRODUCTION"
  "dateCreation": string (ISO)
}

// ApplicationCreateData (request)
{
  "nom": string,
  "description": string,
  "version": string,
  "environnement": string
}
```

---

### 3. Application Links

**Frontend file:** `src/api/applicationLinkApi.ts` + `src/types/applicationLinkTypes.ts`

| Method | Path | Frontend Function |
|--------|------|-------------------|
| GET | `/application-links` | `fetchApplicationLinks(params)` |
| GET | `/application-links/applications/{appId}` | `fetchApplicationLinksByApplication(appId)` |
| GET | `/application-links/{id}` | `fetchApplicationLinkById(id)` |
| POST | `/application-links` | `createApplicationLink(data)` |
| PUT | `/application-links/{id}` | `updateApplicationLink(id, data)` |
| DELETE | `/application-links/{id}` | `deleteApplicationLink(id)` |

**DTOs:**
```json
// ApplicationLink (response)
{
  "id": number,
  "applicationId": number,
  "nom": string,
  "url": string,
  "type": string,  // "production", "recette", "developpement", "documentation", "support", "administration"
  "description": string,
  "dateCreation": string,
  "createdBy": number,
  "createdByUsername": string
}

// ApplicationLinkForm (request)
{
  "applicationId": number,
  "nom": string,
  "url": string,
  "type": string,
  "description": string
}
```

---

### 4. Comptes (Accounts)

**Frontend file:** `src/api/accountApi.ts`

| Method | Path | Frontend Function |
|--------|------|-------------------|
| GET | `/comptes` | `fetchAccounts()` |
| GET | `/comptes/{id}` | `fetchAccountById(id)` |
| POST | `/comptes` | `createAccount(data)` |
| PUT | `/comptes/{id}` | `updateAccount(id, data)` |
| DELETE | `/comptes/{id}` | `deleteAccount(id)` |

**DTOs:**
```json
// Account (response)
{
  "id": number,
  "applicationId": number,
  "username": string,
  "code": string,
  "role": string,  // "USER" | "ADMIN"
  "commentaire": string
}

// AccountCreateData (request)
{
  "applicationId": number,
  "username": string,
  "code": string,
  "role": string,
  "commentaire": string
}
```

---

### 5. Test Sessions

**Frontend file:** `src/api/testSessionApi.ts`

| Method | Path | Frontend Function |
|--------|------|-------------------|
| GET | `/test-sessions` | `fetchTestSessions()` |
| GET | `/test-sessions/{id}` | `fetchTestSessionById(id)` |
| POST | `/test-sessions` | `createTestSession(data)` |
| PUT | `/test-sessions/{id}` | `updateTestSession(id, data)` |
| DELETE | `/test-sessions/{id}` | `deleteTestSession(id)` |
| GET | `/test-sessions/{id}/export` | `exportTestSession(id)` |
| POST | `/test-sessions/{id}/request-close` | `requestCloseSession(id)` |

**DTOs:**
```json
// TestSession (response)
{
  "id": number,
  "nom": string,
  "description": string,
  "applicationId": number | null,
  "environnement": string,
  "version": string | null,
  "statut": string | null,  // "OPEN" | "CLOSED" (default: "OPEN")
  "nom_document": string | null,
  "dateCreation": string (ISO),
  "createdBy": number | null,
  "createdByUsername": string | null,
  "createdByRole": string | null,
  "tests": TestStep[] | null
}

// TestSessionCreateData (request)
{
  "nom": string,
  "description": string,
  "environnement": string,
  "version": string | null,
  "nom_document": string | null,
  "applicationId": number | null
}
```

**Rules:**
- `statut` field must exist (default `OPEN`)
- `createdBy`/`createdByUsername` set from JWT
- Admin sees all sessions, user sees own
- `request-close` endpoint sends notification to all admins

---

### 6. Tests (Test Steps)

**Frontend file:** `src/api/testApi.ts`

| Method | Path | Frontend Function |
|--------|------|-------------------|
| GET | `/tests` | `fetchTestSteps(sessionId)` — params: `sessionId` |
| GET | `/tests` | `fetchAllTests()` |
| GET | `/tests/{id}` | `fetchTestById(id)` |
| POST | `/tests` | `createTest(data)` |
| PUT | `/tests/{id}` | `updateTest(id, data)` |
| DELETE | `/tests/{id}` | `deleteTest(id)` |
| POST | `/bugs` | `reportBug(bugData)` |
| GET | `/bugs/step/{testStepId}` | `fetchBugsByStep(testStepId)` |
| PATCH | `/bugs/{id}/status` | `updateBugStatus(bugId, status)` |

**DTOs:**
```json
// TestStep (response)
{
  "id": number,
  "sessionId": number,
  "applicationId": number | null,
  "applicationNom": string | null,
  "version": string | null,
  "environnement": string | null,
  "fonction": string,
  "precondition": string | null,
  "etapes": string | null,
  "resultatAttendu": string | null,
  "resultatObtenu": string | null,
  "statut": string | null,  // "EN COURS" | "OK" | "BUG"
  "commentaires": string | null,
  "testNumber": number | null,
  "dateCreation": string | null,
  "createdBy": number | null,
  "createdByUsername": string | null,
  "executeur": string | null
}

// Bug (response)
{
  "id": number,
  "testStepId": number,
  "description": string,
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "status": "OPEN" | "FIXED" | "CLOSED"
}
```

**Rules:**
- When session is CLOSED, frontend blocks test creation for non-admin users
- `sessionId` is passed in query params for `fetchTestSteps`
- `updateTest` uses `Partial<TestStep>` — only changed fields sent

---

### 7. Users

**Frontend file:** `src/api/userApi.ts`

| Method | Path | Frontend Function |
|--------|------|-------------------|
| GET | `/users` | `fetchUsers()` |
| GET | `/users/me` | `fetchMe()` |
| PUT | `/users/me` | `updateProfile(data)` |
| PUT | `/users/me/password` | `changePassword(data)` |
| PATCH | `/users/{id}/toggle-status` | `toggleUserStatus(id)` |
| DELETE | `/users/{id}` | `deleteUser(id)` |
| POST | `/users` | `createUser(data)` |
| PUT | `/users/{id}` | `updateUser(id, data)` |
| GET | `/users/available` | `fetchAvailableUsers()` |

**DTOs:**
```json
// User (response)
{
  "id": number,
  "email": string,
  "role": string,  // "USER" | "ADMIN"
  "username": string,
  "isActive": boolean,
  "profilePhoto": string | null,
  "lastPhoneVersion": string | null,
  "createdAt": string | null,
  "password": string | null
}

// CreateUser/UpdateUser data
{
  "username": string,
  "email": string,
  "password"?: string,
  "role"?: string,
  "isActive"?: boolean
}
```

**Rules:**
- `fetchUsers` returns `{ content: User[] }` (paginated)
- Admin endpoints: `createUser`, `updateUser(id)`, `toggleUserStatus`, `deleteUser`
- `fetchMe` returns current user profile

---

### 8. System Notifications

**Frontend file:** `src/api/systemNotificationApi.ts`

| Method | Path | Frontend Function |
|--------|------|-------------------|
| GET | `/system-notifications` | `fetchNotifications()` |
| GET | `/system-notifications/unread` | `fetchUnreadNotifications()` |
| GET | `/system-notifications/unread-count` | `fetchUnreadCount()` |
| PATCH | `/system-notifications/{id}/read` | `markNotificationAsRead(id)` |
| PATCH | `/system-notifications/read-all` | `markAllNotificationsAsRead()` |

**DTOs:**
```json
// SystemNotification (response)
{
  "id": number,
  "title": string,
  "message": string,
  "type": "INFO" | "SUCCESS" | "WARNING" | "ERROR",
  "read": boolean,
  "actionUrl": string | null,
  "createdAt": string (ISO)
}
```

**Rules:**
- `getUserNotifications` returns both personal (targetUserId = current user) and global (targetUserId = null) notifications
- `POST /system-notifications` — admin only, creates notification for specific user
- `POST /system-notifications/global` — admin only, creates global notification for all users

---

## Missing Backend Endpoints to Implement

### 1. CLOSURE — POST `/api/test-sessions/{id}/request-close`
**Frontend function:** `requestCloseSession(id)`  
**Used when:** Non-admin user clicks "Demander cloture" on an OPEN session

**Request:** Empty body `{}` or `{ "requestedBy": <userId> }`  
**Response:** `TestSessionDTO` with updated `statut: "CLOSED"`

**Backend logic:**
1. Verify session exists
2. Set `session.statut = "CLOSED"`
3. Save session
4. Create a system notification for ALL admin users:
   - Title: "Session de test cloturée"
   - Message: "La session '{sessionName}' a été cloturée par {username}"
   - Type: INFO
   - targetUserId: null (global for all admins)

---

## Authentication

- All endpoints require JWT Bearer token
- Token sent in `Authorization: Bearer <token>` header
- Frontend intercepts 401 → redirects to `/login`
- Frontend role-check logic:
  - `user.role === 'admin'` → admin features
  - Otherwise → regular user

---

## Priority Order for Backend Implementation

1. **GET endpoints** — Already mostly exist, verify DTOs match
2. **POST/PUT endpoints** — Verify field names match frontend DTOs
3. **Missing: POST `/test-sessions/{id}/request-close`** — Most critical new feature
4. **Notification system** — Already exists in backend for BugService, reuse pattern for session closure

---

## Frontend-Backend Contract Summary

| Module | Status | Missing |
|--------|--------|---------|
| Bloc Notes | 🟡 Partial | Backend exists but check DTO `createdByUsername` field |
| Applications | 🟢 Ready | All CRUD endpoints exist |
| Application Links | 🟢 Ready | All CRUD endpoints exist |
| Comptes | 🟢 Ready | All CRUD endpoints exist |
| Users | 🟢 Ready | All CRUD endpoints exist (+ `updateUser`) |
| Test Sessions | 🟡 Partial | Missing `request-close` endpoint |
| Tests | 🟢 Ready | All CRUD + bugs endpoints exist |
| Notifications | 🟢 Ready | All endpoints exist |

---

## Deployment Checklist

- [ ] Backend `TestSession` entity has `statut` field (default "OPEN")
- [ ] Backend `TestSessionController` has `POST /{id}/request-close` 
  - Locked to authenticated users
  - Calls `SystemNotificationService.createNotification` or `createGlobalNotification` for all admins
- [ ] Backend `SystemNotificationService` supports `targetUserId: null` for global notifications
- [ ] CORS configured for frontend origin
- [ ] JWT secret key configured
- [ ] Database migrations run (new `statut` column on `test_sessions` table)
