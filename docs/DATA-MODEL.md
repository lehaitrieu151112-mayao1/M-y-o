# Client-side data model

M-Y-O's current prototype is browser-only. There is no database-backed user account yet.

| Storage key | Data | Scope |
|---|---|---|
| `myo-pc-config-v1` | Latest selected PC configuration | Current browser profile |
| `myo-pc-profiles-v1` | Saved local PC setup profiles | Current browser profile |
| `myo-pc-notes-v1` | Note name and text | Current browser profile |
| `myo-pc-recents-v1` | Recently opened external URLs and labels | Current browser profile |

These entries do not sync between devices or users. The file-system handles are kept in memory for the active page session and are not stored as arbitrary filesystem paths. Real directory access relies on the browser's permission API.
