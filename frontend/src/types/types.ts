import { TNode } from "../test/movements";

export enum OrderState {
  active = 'Activo',
  pending = 'Pendiente',
  fullfiled = 'Entregado'
}

export enum PanelType {
  edit = 'Edit',
  create = 'Create',
  filter = 'Filter'
}

export type TOrder = {
  id?: number;
  order?: string;
  quantity: number;
  registerDate?: string;
  term: number;
  orderNode: TNode;
  state?: OrderState
}

export type TOrderError = {
  quantity: boolean;
  term: boolean;
  x: boolean;
  y: boolean;
}