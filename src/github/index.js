const { Octokit } = require("octokit");
const config = require("../config");

let octokit = new Octokit({ auth: config.services.github.authToken });

let userName = config.services.github.userName;

function setUserName(name) {
  userName = name;
}

function setAuthToken(token) {
  octokit = new Octokit({ auth: token });
}

async function getRepositories() {
  const rest = await octokit.request("GET /users/{user}/repos", {
    user: userName,
  });
  //console.log(rest);
  return rest;
}

async function getOrganizations(populate = ["repos_url"]) {
  const rest = await octokit.request("GET /user/orgs");

  if ((populate != null) & (populate.length > 0)) {
    let data = await Promise.all(
      rest.data.map(async (element) => {
        await Promise.all(
          populate.map(async (key) => {
            let request = element[key];
            element[key] = await octokit.request(`GET ${request}`);
          })
        );
        return element;
      })
    );
    rest.data = data;
  }
  return rest;
}

async function getRepositoriesFromOrganizations(withUserContribution = true) {
  const response = await getOrganizations(["repos_url"]);
  let listRepos = response["data"].map((element) => {
    return element["repos_url"]["data"];
  });

  if (withUserContribution) {
    listRepos = await Promise.all(
      listRepos.map(async (reposOrg) => {
        return filterReposUserContribution(reposOrg);
      })
    );
  }
  return listRepos;
}

async function getCollaboratorsFromRepoData(repoData) {
  const key = "contributors_url";
  return await octokit.request(`GET ${repoData[key]} `);
}

function userInCollaborators(collaborators, user = userName) {
  const data = collaborators.filter((item) => item.login === user);
  return data != null && data.length > 0;
}

async function filterReposUserContribution(listRepos) {
  const result = await Promise.all(
    listRepos.map(async (repoData) => {
      collaboratorsResponse = await getCollaboratorsFromRepoData(repoData);
      return userInCollaborators(collaboratorsResponse["data"]);
    })
  );

  return listRepos.filter((_, index) => result[index]);
}

//(async () => {
//  //res = await getOrganizations();
//  //repos = res["data"][0]["repos_url"]["data"];
//  //console.log(repos.length);
//
//  //test_repo = repos[0];
//  //collab = await getCollaboratorsFromRepoData(test_repo);
//  //console.log(userInCollaborators(collab["data"], "abc"));
//
//  //filtered = await filterReposUserContribution(repos);
//  //console.log(filtered.length);
//
//  totalRepos = await getRepositoriesFromOrganizations();
//  console.log(totalRepos);
//  totalRepos.forEach((repos) => console.log(repos.length));
//})();

module.exports = {
  setUserName,
  setAuthToken,
  getRepositories,
  getRepositoriesFromOrganizations,
};
