import axios from 'axios'
import { TBlockage } from '../types/types'
import { useAuthUser } from 'react-auth-kit';
import Cookies from 'js-cookie'

const token = '';

const getBlockages = () => {
  return axios.get(`http://localhost:8080/listarBloqueos`)
}

const insertBlockage = (data: TBlockage) => {
  return axios.post(`http://localhost:8080/insertarBloqueo`, JSON.stringify(data), {
    headers: {
      "Accept": 'application/json',
      "Content-Type": "application/json",
      "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token
    }
  })
}

const editBlockage = (data: TBlockage) => {
  return axios.post(`http://localhost:8080/modificarBloqueo`, JSON.stringify(data), {
    headers: {
      "Accept": 'application/json',
      "Content-Type": "application/json",
      "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token
    }
  })
}

const deleteBlockage = (id: number) => {
  return axios.post(`http://localhost:8080/eliminarBloqueo?id=${ id }`, { headers: { "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token }});
}

export default {
  getBlockages,
  insertBlockage,
  editBlockage,
  deleteBlockage
}