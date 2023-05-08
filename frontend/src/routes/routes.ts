import React from "react";
import { OrdersPage } from '../pages/OrdersPage';
import { SimulationPage } from "../pages/SimulationPage";
import { HomePage } from "../pages/HomePage";
import { WeekSimulationPage } from "../pages/WeekSimulationPage";
import { DailyOperationsPage } from "../pages/DailyOperationsPage";

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
    name: 'Visualización',
    path: '/visualization',
    component: DailyOperationsPage,
    inMenu: true
  }
];

export default routes;