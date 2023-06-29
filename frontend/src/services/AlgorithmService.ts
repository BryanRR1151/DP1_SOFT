import axios from 'axios'
import { DailyFault, DailyPackDetail, TMoment, TPack } from '../test/movements';
import moment from 'moment';
import { useAuthUser } from 'react-auth-kit';
import Cookies from 'js-cookie';

const token = '';

const startWeekly = (initialDate: string) => {
  return axios.get(`http://localhost:8080/StartGenetic?startDate=${ initialDate }`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
};

const startCollapse = (initialDate: string) => {
  return axios.get(`http://localhost:8080/StartCollapse?startDate=${ initialDate }`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const getMoment = (min: number, offset: number) => {
  return axios.get(`http://localhost:8080/GetScreenshot?minute=${ min }&offset=${ offset }`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const kill = () => {
  return axios.get('http://localhost:8080/KillGenetic', { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const initDaily = () => {
  return axios.get('http://localhost:8080/InitDaily', { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const planRoutes = (time: String) => {
  return axios.get(`http://localhost:8080/PlanRoutes?time=${ time }`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const completePack = (idVehicle: number, time: String) => {
  return axios.get(`http://localhost:8080/CompletePack?idVehicle=${ idVehicle }&time=${ time }`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const getBlockages = () => {
  return axios.get(`http://localhost:8080/GetBlockages`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const getPacks = () => {
  return axios.get(`http://localhost:8080/listarPedidos`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const setBlockages = (time: String) => {
  return axios.get(`http://localhost:8080/SetBlockages?time=${ time }`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const insertPack = (pack: TPack) => {
  return axios.post('http://localhost:8080/insertarPedido', pack, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
};

const setFault = (vehicle: String, fault: String, time: String) => {
  return axios.get(`http://localhost:8080/SetFault?vehicle=${ vehicle }&fault=${ fault }&time=${ time }`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const manualKill = (vehicle: String, fault: string) => {
  return axios.get(`http://localhost:8080/ManualKill?vehicle=${ vehicle }&type=${ fault }`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const deletePack = (id: number) => {
  return axios.post(`http://localhost:8080/eliminarPedido?id=${id}`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const getDailyFlag = () => {
  return axios.get(`http://localhost:8080/GetDailyFlag`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const setDailyFlag = (state: boolean) => {
  return axios.get(`http://localhost:8080/SetDailyFlag?state=${state}`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const setDailyMoment = (body: TMoment) => {
  return axios.post('http://localhost:8080/SetMoment', body, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const getDailyMoment = () => {
  return axios.get(`http://localhost:8080/GetMoment`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const setDailyPacks = (body: DailyPackDetail[]) => {
  return axios.post(`http://localhost:8080/SetDailyPacks`, body, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

const getDailyPacks = () => {
  return axios.get(`http://localhost:8080/GetDailyPacks`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
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