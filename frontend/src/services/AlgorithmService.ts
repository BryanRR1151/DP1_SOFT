import axios from 'axios'
import { DailyFault, DailyPackDetail, TMoment, TPack } from '../test/movements';
import moment from 'moment';

const startWeekly = (initialDate: string) => {
  return axios.get(`http://localhost:8080/StartGenetic?startDate=${ initialDate }`);
};

const startCollapse = (initialDate: string) => {
  return axios.get(`http://localhost:8080/StartCollapse?startDate=${ initialDate }`);
}

const getMoment = (min: number, offset: number) => {
  return axios.get(`http://localhost:8080/GetScreenshot?minute=${ min }&offset=${ offset }`)
}

const kill = () => {
  return axios.get('http://localhost:8080/KillGenetic');
}

const initDaily = () => {
  return axios.get('http://localhost:8080/InitDaily');
}

const planRoutes = (time: String) => {
  return axios.get(`http://localhost:8080/PlanRoutes?time=${ time }`)
}

const completePack = (idVehicle: number, time: String) => {
  return axios.get(`http://localhost:8080/CompletePack?idVehicle=${ idVehicle }&time=${ time }`)
}

const getBlockages = () => {
  return axios.get(`http://localhost:8080/GetBlockages`)
}

const getPacks = () => {
  return axios.get(`http://localhost:8080/listarPedidos`)
}

const setBlockages = (time: String) => {
  return axios.get(`http://localhost:8080/SetBlockages?time=${ time }`)
}

const insertPack = (pack: TPack) => {
  return axios.post('http://localhost:8080/insertarPedido', pack);
};

const setFault = (vehicle: String, fault: String, time: String) => {
  return axios.get(`http://localhost:8080/SetFault?vehicle=${ vehicle }&fault=${ fault }&time=${ time }`)
}

const manualKill = (vehicle: String, fault: string) => {
  return axios.get(`http://localhost:8080/ManualKill?vehicle=${ vehicle }&type=${ fault }`)
}

const deletePack = (id: number) => {
  return axios.post(`http://localhost:8080/eliminarPedido?id=${id}`);
}

const getDailyFlag = () => {
  return axios.get(`http://localhost:8080/GetDailyFlag`)
}

const setDailyFlag = (state: boolean) => {
  return axios.get(`http://localhost:8080/SetDailyFlag?state=${state}`)
}

const setDailyMoment = (body: TMoment) => {
  return axios.post('http://localhost:8080/SetMoment', body)
}

const getDailyMoment = () => {
  return axios.get(`http://localhost:8080/GetMoment`)
}

const setDailyPacks = (body: DailyPackDetail[]) => {
  return axios.post(`http://localhost:8080/SetDailyPacks`, body)
}

const getDailyPacks = () => {
  return axios.get(`http://localhost:8080/GetDailyPacks`)
}

const setDailyFault = (body : DailyFault) => {
  return axios.post(`http://localhost:8080/SetDailyFaults`, body)
}

const getDailyFaults = () => {
  return axios.get(`http://localhost:8080/GetDailyFaults`)
}
 
export default {
  startWeekly,
  startCollapse,
  getMoment,
  kill,
  initDaily,
  planRoutes,
  completePack,
  getBlockages,
  insertPack,
  getPacks,
  setBlockages,
  setFault,
  manualKill,
  deletePack,
  getDailyFlag,
  setDailyFlag,
  setDailyMoment,
  getDailyMoment,
  setDailyPacks,
  getDailyPacks,
  setDailyFault,
  getDailyFaults
};