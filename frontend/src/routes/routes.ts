import React from "react";
import { OrdersPage } from '../pages/OrdersPage';
import { SimulationPage } from "../pages/SimulationPage";
import { HomePage } from "../pages/HomePage";
import { WeekSimulationPage } from "../pages/WeekSimulationPage";
import { DailyOperationsPage } from "../pages/DailyOperationsPage";
import { BlockagesPage } from "../pages/BlockagesPage";
import { CollapsePage } from "../pages/CollapsePage";
import { Login } from "../auth/Login";

type Route = {
  name: string;
  path: string;
  component: () => JSX.Element;
  icon?: string;
  inMenu: boolean;
}

const routes: Route[] = [
  {
    name: 'Home',
    path: '/',
    component: HomePage,
    inMenu: false
  },
  {
    name: 'Pedidos',
    path: '/pedidos',
    component: OrdersPage,
    inMenu: true
  },
  {
    name: 'Simulacion',
    path: '/simulacion',
    component: SimulationPage,
    inMenu: true
  },
  {
    name: 'Simulacion Semanal',
    path: '/simulacion/semanal',
    component: WeekSimulationPage,
    inMenu: false
  },
  {
    name: 'Colapso Logístico',
    path: '/simulacion/colapso',
    component: CollapsePage,
    inMenu: false
  },
  {
    name: 'Visualización',
    path: '/visualization',
    component: DailyOperationsPage,
    inMenu: true
  },
  {
    name: 'Bloqueos',
    path: '/blockages',
    component: BlockagesPage,
    inMenu: true
  }
];

export default routes;