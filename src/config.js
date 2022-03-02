require("dotenv").config();

const config = {
  google: {
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    keyFile: process.env.GOOGLE_KEY_FILENAME || "./key.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  },
  services: {
    github: {
      type: "repository",
      name: "GitHub",
      userName: process.env.GITHUB_USERNAME,
      authToken: process.env.GITHUB_TOKEN,
      defaultSheetName: "github",
      requests: {
        repositories: {
          keys: [
            "id",
            "node_id",
            "name",
            "full_name",
            "private",
            "description",
            "html_url",
            "fork",
            "stargazers_count",
            "watchers_count",
            "forks_count",
            "created_at",
            "updated_at",
            "pushed_at",
            "language",
            {
              root: "owner",
              keys: ["login", "id", "html_url"],
            },
          ],
        },
      },
    },
    gitlab: {
      type: "repository",
      name: "GitLab",
      userName: process.env.GITLAB_USERNAME,
      authToken: process.env.GITLAB_TOKEN,
      defaultSheetName: "gitlab",
      requests: {
        repositories: {
          keys: [
            "id",
            "name",
            "path",
            "path_with_namespace",
            "visibility",
            "description",
            "web_url",
            "mirror",
            "star_count",
            "forks_count",
            "created_at",
            "last_activity_at",
            {
              root: "namespace",
              keys: ["id", "name", "kind", "web_url"],
            },
          ],
        },
      },
    },
  },
};

module.exports = config;
