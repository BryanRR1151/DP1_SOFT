import axios from 'axios'

const startWeekly = (data: FormData) => {
  return axios.post('http://localhost:8080/StartGenetic', data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const startCollapse = (data: FormData) => {
  return axios.post('http://localhost:8080/StartCollapse', data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

const planRoutes = (time: number) => {
  return axios.get(`http://localhost:8080/PlanRoutes?minute=${ time }`)
}

const completePack = (idVehicle: number) => {
  return axios.get(`http://localhost:8080/CompletePack?minute=${ idVehicle }`)
}

export default {
  startWeekly,
  startCollapse,
  getMoment,
  kill,
  initDaily,
  planRoutes,
  completePack
};