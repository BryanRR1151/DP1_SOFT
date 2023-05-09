export type TNode = {
  x: number;
  y: number;
  blocked?: boolean;
  destination?: boolean;
}

export type TMovement = {
  from: TNode;
  to: TNode;
}

export enum VehicleType {
  moto = 'Moto',
  auto = 'Auto' 
}

export type TVehicle = {
  id: number;
  type: VehicleType;
  speed: number;
  cost: number;
  turn: number;
  overtime: number;
  state: number;
  capacity: number;
  carry: number;
  moved: boolean;
  pack: TPack;
  location: TNode;
  route?: TSolution;
  step: number;
  movement: TMovement;
}

export type TSolution = {
  chroms: TChrom;
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
  start: number;
  end: number;
}

export type TMoment = {
  min: number;
  ordersDelivered: number;
  fleetCapacity: number;
  activeVehicles: TVehicle[];
  activePacks: TPack[];
  activeBlockages: TBlockage[];
}

// export let testMoments: TMoment[] = [
//   {
//     min: 1,
//     vehicles: [
//       {
//         id: 1,
//         type: VehicleType.auto,
//         capacity: 0,
//         arrived: false,
//         movement: {
//           from: { x: 0, y: 0 },
//           to: { x: 0, y: 0 }
//         }
//       },
//       {
//         id: 2,
//         type: VehicleType.moto,
//         arrived: true,
//         movement: {
//           from: { x: 0, y: 0 },
//           to: { x: 0, y: 0 }
//         }
//       }
//     ]
//   },
//   {
//     min: 2,
//     vehicles: [
//       {
//         id: 1,
//         type: VehicleType.auto,
//         capacity: 0,
//         arrived: false,
//         movement: {
//           from: { x: 0, y: 0 },
//           to: { x: 0, y: 1 }
//         }
//       },
//       {
//         id: 2,
//         type: VehicleType.moto,
//         arrived: true,
//         movement: {
//           from: { x: 0, y: 0 },
//           to: { x: 0, y: 1 }
//         }
//       }
//     ]
//   },
//   {
//     min: 3,
//     vehicles: [
//       {
//         id: 1,
//         type: VehicleType.auto,
//         capacity: 0,
//         arrived: true,
//         movement: {
//           from: { x: 0, y: 0 },
//           to: { x: 0, y: 1 }
//         }
//       },
//       {
//         id: 2,
//         type: VehicleType.moto,
//         arrived: true,
//         movement: {
//           from: { x: 0, y: 1 },
//           to: { x: 0, y: 2 }
//         }
//       }
//     ]
//   },
//   {
//     min: 4,
//     vehicles: [
//       {
//         id: 1,
//         type: VehicleType.auto,
//         capacity: 0,
//         arrived: false,
//         movement: {
//           from: { x: 0, y: 1 },
//           to: { x: 0, y: 2 }
//         }
//       },
//       {
//         id: 2,
//         type: VehicleType.moto,
//         arrived: true,
//         movement: {
//           from: { x: 0, y: 2 },
//           to: { x: 1, y: 2 }
//         }
//       }
//     ]
//   },
// ]
