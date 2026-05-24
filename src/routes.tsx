import { NanoRedWhalePage } from './pages/NanoRedWhalePage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'NANO RED WHALE',
    path: '/',
    element: <NanoRedWhalePage />
  }
];

export default routes;
