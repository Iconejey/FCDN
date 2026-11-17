# API & Data Structure Documentation

This document describes the HTTP API provided by `server.js` and the user data structures used across the application.

---

## 1. Overview

The application uses Express on Node.js to serve static frontend assets and provide JSON file storage for user adventure progress.

- **Port**: `8011`
- **Data Directory**: `data/` (stored locally as `{id}.json`, ignored by Git)
- **User Identifier**: 16-character base 32 random string generated client-side and saved in `localStorage` under `user_id`.

---

## 2. API Endpoints

### `GET /api/data/:id`

Retrieves the saved JSON data associated with the base 32 user ID (`:id`).

- **Parameters**:
    - `id` _(string)_: The base 32 user identifier (e.g. `hqcc08pdbevtvc44`).
- **Responses**:
    - `200 OK`: Returns the JSON contents of `data/{id}.json`. If the file does not exist, returns `{}`.

---

### `POST /api/data/:id`

Saves or updates the user data JSON file for the given user ID.

- **Parameters**:
    - `id` _(string)_: The base 32 user identifier.
- **Request Body**:
    - `application/json`: Complete root data object containing book progress mapping.
- **Responses**:
    - `200 OK`: `{ "success": true }`

---

### `GET /nolib/*`

Serves static frontend components provided by the `nolib` package.

---

### `GET /{*splat}`

Fallback SPA route. Returns `public/index.html` for non-file requests.

---

## 3. Client Storage & Migration

### Base 32 User ID

Generated via standard JavaScript Web Crypto API:

```javascript
Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => (byte % 32).toString(32)).join('');
```

Stored in `localStorage` key: `'user_id'`.

### Backward Compatibility & LocalStorage Backup

On application initialization:

1. If legacy data is found in `localStorage.getItem('data')`:
    - Normalizes old single-book structure if `pv` field is detected: `{ FCDN: data }`.
    - Saves a raw backup copy into `localStorage.setItem('backup', string_data)`.
    - Removes the legacy `localStorage.removeItem('data')`.
    - Automatically POSTs the migrated data to `/api/data/{user_id}` on the server.
2. If no legacy data is found:
    - Fetches existing data from `/api/data/{user_id}`.

---

## 4. Data Structures

The application root data object maps book identifiers (e.g., `"FCDN"`, `"CDSI"`) to the character's adventure state.

### Root Object

```json
{
  "FCDN": { ... },
  "CDSI": { ... }
}
```

### Book User Data (`BookUserData`)

| Attribute         | Type                     | Description                                                                                 |
| :---------------- | :----------------------- | :------------------------------------------------------------------------------------------ |
| `personality`     | `string`                 | Character personality type (e.g., `"DÉBROUILLARD"`, `"GUERRIER"`, `"PRUDENT"`, `"PAYSAN"`). |
| `equipment`       | `string[]`               | List of equipped item labels selected by the player.                                        |
| `pv`              | `number`                 | Current health/hit points (Points de Vie).                                                  |
| `chance`          | `number`                 | Current luck points.                                                                        |
| `wealth`          | `number`                 | Gold / wealth currency.                                                                     |
| `glory`           | `number` _(FCDN only)_   | Player glory score.                                                                         |
| `respect`         | `number` _(CDSI only)_   | Respect score.                                                                              |
| `resentment`      | `number` _(CDSI only)_   | Resentment score.                                                                           |
| `bonuses`         | `object`                 | Stat modifiers object (see structure below).                                                |
| `collected_items` | `string[]`               | List of items collected during adventure.                                                   |
| `adventure_notes` | `string[]`               | Player-written notes for the adventure.                                                     |
| `chap_history`    | `number[]` \| `string[]` | Log of visited book chapters.                                                               |

### Stat Modifiers Object (`bonuses`)

```json
{
	"hab": 0,
	"adr": 0,
	"end": 0,
	"cha": 0,
	"deg": 0,
	"arm": 0,
	"crit": 0,
	"pv_max": 0
}
```

- **`hab`**: Habileté (Skill)
- **`adr`**: Adresse (Agility)
- **`end`**: Endurance (Stamina)
- **`cha`**: Chance Max (Max Luck)
- **`deg`**: Dégâts (Damage)
- **`arm`**: Armure (Armor)
- **`crit`**: Critique (Critical hit bonus)
- **`pv_max`**: Maximum Health Points bonus
