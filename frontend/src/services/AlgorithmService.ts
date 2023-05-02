import axios from 'axios'

const start = () => {
  return axios.get('http://localhost:8080/StartGenetic');
};

const getMoment = (min: number) => {
  return axios.get(`http://localhost:8080/GetScreenshot?minute=${ min }`)
}

const kill = () => {
  return axios.get('http://localhost:8080/KillGenetic');
}

export default {
  start,
  getMoment,
  kill
};