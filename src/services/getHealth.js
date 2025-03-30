import axios from "axios";

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "http://10.25.13.188:8000/api/health",
  headers: {},
  data: "",
};

async function getHealth() {
  console.log("Axios = ", axios);
  return await axios.request(config);
}

export default getHealth;
