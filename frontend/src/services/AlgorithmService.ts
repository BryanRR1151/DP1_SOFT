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

export default {
  start,
  getMoment,
  kill
};