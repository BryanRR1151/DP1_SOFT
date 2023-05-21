import axios from 'axios'

const start = (data: FormData) => {
  return axios.post('http://localhost:8080/StartGenetic', data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const getMoment = (min: number) => {
  return axios.get(`http://localhost:8080/GetScreenshot?minute=${ min }`)
}

const kill = () => {
  return axios.get('http://localhost:8080/KillGenetic');
}

const initDaily = () => {
  return axios.get('http://localhost:8080/InitDaily');
}

co
nst planRoutes = (time: number) => {
  return axios.get(`http://localhost:8080/PlanRoutes?minute=${ time }`)
}

const completePack = (idVehicle: number) => {
  return axios.get(`http://localhost:8080/CompletePack?minute=${ idVehicle }`)
}

export default {
  start,
  getMoment,
  kill,
  initDaily,
  planRoutes,
  completePack
};