import { Landing } from './pages/Landing.tsx';
import { Admin } from './pages/Admin.tsx';

/**
 * Two routes only, so a router dependency would be all cost and no benefit.
 * The Express catch-all serves index.html for both paths in production.
 */
export function App() {
  return window.location.pathname.startsWith('/admin') ? <Admin /> : <Landing />;
}
