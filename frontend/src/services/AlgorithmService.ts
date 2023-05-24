import axios from 'axios'
import { TPack } from '../test/movements';

const start = (data: FormData) => {
  return axios.post('http://localhost:8080/StartGenetic', data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

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

const completePack = (idVehicle: number) => {
  return axios.get(`http://localhost:8080/CompletePack?idVehicle=${ idVehicle }`)
}

const getBlockages = () => {
  return axios.get(`http://localhost:8080/GetBlockages`)
}

const getPacks = () => {
  return axios.get(`http://localhost:8080/listarPedidos`)
}

const insertPack = (pack: TPack) => {
  return axios.post('http://localhost:8080/insertarPedido', pack);
};
export default {
  start,
  getMoment,
  kill,
  initDaily,
  planRoutes,
  completePack,
  getBlockages,
  insertPack,
  getPacks
};