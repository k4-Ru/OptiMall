import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  );
}
