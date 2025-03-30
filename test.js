const axios = require("axios");

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "http://127.0.0.1:8000/api/health",
  headers: {},
};

async function getHealth() {
  const response = await axios.request(config);
  return response;
}

module.exports = getHealth;
