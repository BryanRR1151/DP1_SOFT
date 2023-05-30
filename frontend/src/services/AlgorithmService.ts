import axios from 'axios'
import { TPack } from '../test/movements';

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
  setFault
};