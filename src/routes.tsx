// Route path types — used for type-safe navigation throughout the app.
// The actual route definitions live in App.tsx to avoid Fast Refresh issues.

export type Path =
  | '/'
  | '/produce'
  | '/bulk-export'
  | '/farmer-dashboard'
  | '/farmers'
  | '/cart'
  | '/login'
  | '/signup';

export type Params = Record<string, string | undefined>;
