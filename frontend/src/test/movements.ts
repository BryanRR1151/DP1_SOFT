export type TNode = {
  x: number;
  y: number;
  blocked?: boolean;
  destination?: boolean;
}

export type TMovement = {
  from: TNode | null;
  to: TNode | null;
}

export enum VehicleType {
  moto = 'Moto',
  auto = 'Auto' 
}

export type TVehicle = {
  id: number;
  code?: String;
  type: VehicleType;
  speed: number;
  cost: number;
  turn: number;
  overtime: number;
  state: number;
  capacity: number;
  carry: number;
  moved: boolean;
  pack: TPack | null;
  location: TNode | null;
  route?: TSolution | null;
  step: number;
  movement: TMovement | null;
  broken?: boolean;
  resumeAt?: number;
  stopTime?: number;
}

export type TSolution = {
  chroms: TChrom[];
}

export type TChrom = {
  from: TNode;
  to: TNode;
}

export type TPack = {
  id: number;
  idCustomer: number;
  originalTime: number;
  deadline: number;
  time: number;
  demand: number;
  fullfilled: number;
  unassigned: number;
  location: TNode;
}

export type TBlockage = {
  id: number;
  node: TNode;
  secondNode: TNode;
  start: number;
  end: number;
}

export type TFinish = {
  code: number;
  message: string;
  maxCapacity: number;
  totalPack: number;
  minute: number;
  capacityHourly: number[];
  packsHourly: number[];
}

export type TMoment = {
  min: number;
  ordersDelivered: number;
  ordersLeft: number;
  fleetCapacity: number;
  activeVehicles: TVehicle[];
  activePacks: TPack[];
  activeBlockages: TBlockage[];
  collapse?: boolean;
  finish?: TFinish;
  faultVehicles?: TVehicle[];
}

export type DailyPackDetail = {
  id: number;
  x: number;
  y: number;
  secondsLeft: number;
  carAmount: number;
  bikeAmount: number;
}