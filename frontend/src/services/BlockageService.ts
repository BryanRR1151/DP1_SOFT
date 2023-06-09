import axios from 'axios'
import { TBlockage } from '../types/types'
import { useAuthUser } from 'react-auth-kit';
import Cookies from 'js-cookie'

const token = '';

const getBlockages = () => {
  return axios.get(`http://localhost:8080/api/listarBloqueos`)
}

const insertBlockage = (data: TBlockage) => {
  return axios.post(`http://localhost:8080/api/insertarBloqueo`, JSON.stringify(data), {
    headers: {
      "Accept": 'application/json',
      "Content-Type": "application/json"
    }
  })
}

const editBlockage = (data: TBlockage) => {
  return axios.post(`http://localhost:8080/api/modificarBloqueo`, JSON.stringify(data), {
    headers: {
      "Accept": 'application/json',
      "Content-Type": "application/json"
    }
  })
}

const deleteBlockage = (id: number) => {
  return axios.post(`http://localhost:8080/api/eliminarBloqueo?id=${ id }`);
}

export default {
  getBlockages,
  insertBlockage,
  editBlockage,
  deleteBlockage
}