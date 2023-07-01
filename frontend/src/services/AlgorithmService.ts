import axios from 'axios'
import { DailyFault, DailyPackDetail, TMoment, TPack } from '../test/movements';
import moment from 'moment';
import { useAuthUser } from 'react-auth-kit';
import Cookies from 'js-cookie';

const token = '';

const startWeekly = (initialDate: string) => {
  return axios.get(`http://localhost:8080/api/StartGenetic?startDate=${ initialDate }`);
};

const startCollapse = (initialDate: string) => {
  return axios.get(`http://localhost:8080/api/StartCollapse?startDate=${ initialDate }`);
}

const getMoment = (min: number, offset: number) => {
  return axios.get(`http://localhost:8080/api/GetScreenshot?minute=${ min }&offset=${ offset }`);
}

const kill = () => {
  return axios.get('http://localhost:8080/api/KillGenetic');
}

const initDaily = () => {
  return axios.get('http://localhost:8080/api/InitDaily');
}

const planRoutes = (time: String) => {
  return axios.get(`http://localhost:8080/api/PlanRoutes?time=${ time }`);
}

const completePack = (idVehicle: number, time: String) => {
  return axios.get(`http://localhost:8080/api/CompletePack?idVehicle=${ idVehicle }&time=${ time }`);
}

const getBlockages = () => {
  return axios.get(`http://localhost:8080/api/GetBlockages`);
}

const getPacks = () => {
  return axios.get(`http://localhost:8080/api/listarPedidos`);
}

const setBlockages = (time: String) => {
  return axios.get(`http://localhost:8080/api/SetBlockages?time=${ time }`);
}

const insertPack = (pack: TPack) => {
  return axios.post('http://localhost:8080/api/insertarPedido', pack);
};

const setFault = (vehicle: String, fault: String, time: String) => {
  return axios.get(`http://localhost:8080/api/SetFault?vehicle=${ vehicle }&fault=${ fault }&time=${ time }`);
}

const manualKill = (vehicle: String, fault: string) => {
  return axios.get(`http://localhost:8080/api/ManualKill?vehicle=${ vehicle }&type=${ fault }`);
}

const deletePack = (id: number) => {
  return axios.post(`http://localhost:8080/api/eliminarPedido?id=${id}`);
}

const getDailyFlag = () => {
  return axios.get(`http://localhost:8080/api/GetDailyFlag`);
}

const setDailyFlag = (state: boolean) => {
  return axios.get(`http://localhost:8080/api/SetDailyFlag?state=${state}`);
}

const setDailyMoment = (body: TMoment) => {
  return axios.post('http://localhost:8080/api/SetMoment', body);
}

const getDailyMoment = () => {
  return axios.get(`http://localhost:8080/api/GetMoment`);
}

const setDailyPacks = (body: DailyPackDetail[]) => {
  return axios.post(`http://localhost:8080/api/SetDailyPacks`, body);
}

const getDailyPacks = () => {
  return axios.get(`http://localhost:8080/api/GetDailyPacks`);
}

const setDailyFault = (body : DailyFault) => {
  return axios.post(`http://localhost:8080/api/SetDailyFaults`, body)
}

const getDailyFaults = () => {
  return axios.get(`http://localhost:8080/api/GetDailyFaults`)
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