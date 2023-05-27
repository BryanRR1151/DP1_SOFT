import { TNode } from "../test/movements";

export enum OrderState {
  active = 'Activo',
  pending = 'Pendiente',
  fullfiled = 'Entregado'
}

export enum PanelType {
  edit = 'Edit',
  create = 'Create',
  filter = 'Filter',
  simulationFiles = 'SimulationFiles',
  simulationDetails = 'SimulationDetails',
  vehicleInfo = 'VehicleInfo'
}

export type TOrder = {
  id?: number;
  idCustomer?: number;
  order?: string;
  quantity: number;
  registerDate?: string;
  term: number;
  orderNode: TNode;
  state?: OrderState
}

export type TOrderError = {
  idCustomer: boolean;
  quantity: boolean;
  term: boolean;
  x: boolean;
  y: boolean;
}

export type TBlockage = {
  id?: number;
  node: TNode;
  start: string;
  end: string;
}

export type TBlockageError = {
  start: boolean;
  end: boolean;
  x: boolean;
  y: boolean;
}

export const panelStyles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    backgroundColor: "#fff",
    boxShadow: "2px 0 6px rgba(0, 0, 0, 0.3)",
    zIndex: 9999,
    transition: "width 0.3s ease-in-out",
    padding: 0
  } as const,
  panelOpen: {
    width: 350,
    padding: 1,
    paddingTop: 3
  } as const,
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9998,
  } as const,
};