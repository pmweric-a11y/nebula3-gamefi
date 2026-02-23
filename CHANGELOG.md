# Changelog - Security and Optimization Audit (2026-02-23)

## [Security]
- **Server-side Authentication**: Introduced `src/middleware.ts` to protect all `/admin` routes (except `/admin/login`) at the server level.
- **Improved Token Management**: Migrated to `@supabase/ssr` for better session handling and security in Next.js.
- **Route Protection**: Unauthenticated users are now redirected to `/admin/login` before the page even begins to load on the client.
- **Admin Verification**: Added server-side check in middleware to verify that the authenticated user exists in the `admins` whitelist table.

## [Optimization]
- **Removed Redundant Logic**: Eliminated client-side `useEffect` authentication checks in `AdminDashboard` and `AdminInvitePage`, reducing initial load time and preventing "flash of unauthenticated content".
- **Code Refactoring**: Updated `src/lib/supabase.ts` to support both client-side and server-side client creation with proper TypeScript generics.
- **Bundle Optimization**: Cleanup of unused imports and improved type safety for Supabase operations.
- **Mobile Responsiveness**: Verified and maintained styling for glassmorphism UI components across mobile devices.

## [Fixed]
- **TypeScript Errors**: Resolved multiple lint errors related to Supabase database type inference.
- **Auth Redirects**: Fixed potential infinite redirect loops by excluding `/admin/login` from middleware protection.
