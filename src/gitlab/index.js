const axios = require("axios");
const config = require("../config");

let instance = axios.create({
  baseURL: "https://gitlab.com/api/v4",
  headers: { Authorization: `Bearer ${config.services.gitlab.authToken}` },
});

let userName = config.services.gitlab.userName;

function setUserName(name) {
  userName = name;
}

function setAuthToken(token) {
  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

async function getProjects(per_page = 100) {
  return await instance.get("/projects", {
    params: {
      membership: true,
      per_page: per_page,
    },
  });
}

//(async () => {
//  console.log(await getProjects());
//})();

module.exports = {
  getProjects,
  setUserName,
  setAuthToken,
};
