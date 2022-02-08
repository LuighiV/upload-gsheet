const {
  getRepositories,
  getRepositoriesFromOrganizations,
} = require("../github");
const { objectToList, keysToList, flatListItems } = require("../utils");
const config = require("../config");

async function getRepositoryList(flat = true) {
  const data = await getRepositories();
  return getRepositoryListFromObject(data["data"], flat);
}

function getRepositoryListFromObject(data, flat = true) {
  const reference_keys = config.services.github.requests.repositories.keys;
  const list = objectToList(data, reference_keys);
  const keys = keysToList(reference_keys);
  return {
    keys: flat ? keys.flat() : keys,
    values: flat ? flatListItems(list) : list,
  };
}

async function getRepositoryListFromOrganizations(flat = true) {
  totalRepos = await getRepositoriesFromOrganizations();
  return getRepositoriesFromOrganizationsListObject(totalRepos);
}

async function getRepositoriesFromOrganizationsListObject(list, flat = true) {
  const reference_keys = config.services.github.requests.repositories.keys;

  return list.map((reposOrg) => getRepositoryListFromObject(reposOrg, flat));
}

//(async () => {
//  data = await getRepositoryList();
//  console.log(data);
//
//  dataOrg = await getRepositoryListFromOrganizations();
//  console.log(dataOrg);
//})();

module.exports = {
  getRepositoryList,
  getRepositoryListFromOrganizations,
};
