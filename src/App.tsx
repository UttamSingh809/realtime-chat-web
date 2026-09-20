import { useEffect } from 'react';
import { AppRoutes } from '@/routes/AppRoutes';
import { installSidebarAutoExpand } from '@/stores/ui.store';

export default function App() {
  useEffect(() => installSidebarAutoExpand(), []);
  return <AppRoutes />;
}
