import axios from 'axios'

var headers = {}
const token = localStorage.getItem('bazam-token-control')

var baseUrl = process.env.NODE_ENV === 'development' ? 'http://api.cs100.cl/v1' : 'http://api.cs100.cl/v1'

if (token !== null && token !== undefined && token !== '') {
  headers['Authorization'] = 'Bearer ' + token
}

var instance = axios.create({
  baseURL: baseUrl,
  headers: headers
})
export default instance
