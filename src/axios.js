import axios from "axios";
import env from "../config/env";
//const env = process.env.NODE_ENV === "development" ? dev : prod;

var headers = {};
const token = localStorage.getItem("bazam-token-control");

if (token !== null && token !== undefined && token !== "") {
  headers["Authorization"] = "Bearer " + token;
}
var instance = axios.create({
  baseURL: env.API_BASE,
  headers: headers
});
console.log(env.API_URL);
export const nodeInstance = axios.create({
  baseURL: env.API_URL,
  headers: headers
});
export default instance;
