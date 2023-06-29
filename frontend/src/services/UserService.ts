import axios from 'axios'
import { TUser } from '../types/types'
import { useAuthUser } from 'react-auth-kit';
import Cookies from 'js-cookie';

const loginUser = (data: TUser) => {
  return axios.post(`http://localhost:8080/login`, JSON.stringify(data), {
    headers: {
      "Accept": 'application/json',
      "Content-Type": "application/json"
    }
  })
}

const logout = (data: TUser) => {
  return axios.post(`http://localhost:8080/logout`, JSON.stringify(data), {
    headers: {
      "Accept": 'application/json',
      "Content-Type": "application/json",
      "Authorization": JSON.parse(Cookies.get('_auth_state') ?? '{}').token
    }
  })
}

export default {
  loginUser,
  logout
}