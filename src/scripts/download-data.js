const {
  getAllRepositories,
  getRepositories,
  getRepositoriesFromOrganizations,
  filterReposUserContribution,
} = require("../github");
const { objectToList, keysToList, flatListItems } = require("../utils");
const config = require("../config");
const { logger } = require("../logger");

async function getRepositoryList(flat = true) {
  const data = await getRepositories();
  return getRepositoryListFromObject(data["data"], flat);
}

async function getAllRepositoryList(flat = true, onlyContributed = true) {
  let repos = await getAllRepositories();

  logger.info(`Total list of repositories has ${repos.length} items`);

  if (onlyContributed) {
    logger.info("Selecting only repositories that have user contribution");
    repos = await filterReposUserContribution(repos);

    logger.info(
      `Repositories with user contribution has ${repos.length} items`
    );
  }

  return getRepositoryListFromObject(repos, flat);
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
  return getRepositoriesFromOrganizationsListObject(totalRepos, flat);
}

async function getRepositoriesFromOrganizationsListObject(list, flat = true) {
  return list.map((reposOrg) => getRepositoryListFromObject(reposOrg, flat));
}

//(async () => {
//  // data = await getRepositoryList();
//  // console.log(data);
//
//  // dataOrg = await getRepositoryListFromOrganizations();
//  // console.log(dataOrg);
//
//  data = await getAllRepositoryList();
//  console.log(data);
//})();

module.exports = {
  getRepositoryList,
  getAllRepositoryList,
  getRepositoryListFromOrganizations,
};
