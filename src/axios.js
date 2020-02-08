import axios from "axios";
import prod from "../config/prod.env";
import dev from "../config/dev.env";
const env = process.env.NODE_ENV === "development" ? dev : prod;

var headers = {};
const token = localStorage.getItem("bazam-token-control");

var baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:9090/v1"
    : "http://api.cs100.cl/v1"; 

if (token !== null && token !== undefined && token !== "") {
  headers["Authorization"] = "Bearer " + token;
}
console.log(headers)
var instance = axios.create({
  baseURL: baseUrl,
  headers: headers
});
console.log(env.API_URL.toString())

export const nodeInstance = axios.create({
  baseURL: env.API_URL.toString(),
  headers: headers
});
export default instance;
