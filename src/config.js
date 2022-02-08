require("dotenv").config();

const config = {
  google: {
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    keyFile: process.env.GOOGLE_KEY_FILENAME || "./key.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  },
  services: {
    github: {
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
  },
};

module.exports = config;
