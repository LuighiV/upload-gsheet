const {
  getAllRepositories,
  getRepositoriesFromOrganizations,
  filterReposUserContribution,
} = require("../github");
const { getProjects } = require("../gitlab");
const { objectToList, keysToList, flatListItems } = require("../utils");
const config = require("../config");
const { logger } = require("../logger");

async function getAllRepositoryList(
  flat = true,
  onlyContributed = true,
  service = "github"
) {
  let repos = null;
  switch (service) {
    case "github":
      repos = await getAllRepositories();

      break;
    case "gitlab":
      repos = await getProjects();
      repos = repos["data"];

      break;

    default:
      throw new Error("Not valid service");
  }

  logger.info(`Total list of repositories has ${repos.length} items`);

  if (onlyContributed && service === "github") {
    logger.info("Selecting only repositories that have user contribution");
    repos = await filterReposUserContribution(repos);

    logger.info(
      `Repositories with user contribution has ${repos.length} items`
    );
  }

  return getRepositoryListFromObject(repos, flat, service);
}

function getRepositoryListFromObject(data, flat = true, service = "github") {
  const reference_keys = config.services[service].requests.repositories.keys;
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
  getAllRepositoryList,
  getRepositoryListFromOrganizations,
};
