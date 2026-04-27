# Fix IoTSensorValidationScreen.tsx Errors

## Errors Found (from tsc --noEmit)
1. `Property 'token' does not exist on type 'AuthContextType'` (line 30)
2. `Property 'id' does not exist on type 'never'` (lines 285-291)
3. `Property 'name' does not exist on type 'never'` (line 290)

## Root Causes
- `useAuth()` hook does not expose `token`.
- `availableUsers` state is initialized as `useState([])` without explicit type, so TS infers `never[]`.

## Plan
1. **Update `src/context/AuthContext.tsx`**
   - Add `token: string | null` to `AuthContextType`.
   - Add `token` state in provider.
   - Update `login` signature to accept `token` and persist it via `saveAuthToken`.
   - Load token on mount using `getAuthToken`.
   - Clear token on logout.

2. **Update `src/screens/IoTSensorValidationScreen.tsx`**
   - Explicitly type `availableUsers` state: `Array<{ id: number; name: string }>`.
   - Explicitly type `selectedUser` state: `{ id: number; name: string } | null`.
   - Explicitly type `logs` state: `any[]`.

