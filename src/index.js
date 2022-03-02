#!/usr/bin/env node
const { logger, transports } = require("./logger");
const Commander = require("commander");
const { getAllRepositoryList } = require("./scripts/download-data");
const { uploadTableFromObject } = require("./scripts/upload-data");
const { setSpreadSheetId, setAuthKeyFile } = require("./gsheet");
const packageJson = require("../package.json");
const github = require("./github");
const gitlab = require("./gitlab");
const config = require("./config");
const err = require("./error");
const fs = require("fs");

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .usage(`[options]`)
  .option(
    "-l, --log-level <level>",
    `

  Specify the log-level, by default info.
  Possible values: error, warning, notice, info, debug
`
  )
  .option(
    "--sheet-id <id>",
    `

  Specify the Spreadsheet ID which serves to update data.
  Also, can be specified by environmental variable GOOGLE_SHEET_ID
`
  )
  .option(
    "--key-file <filename>",
    `

  Specify the key filename to authenticate with Google service.
  By default, it is key.json
`
  )
  .option(
    "-s, --service <service>",
    `

  Specify the service name from which obtain the data to upload.
  The available option is: github
`
  )
  .option(
    "--github-username <username>",
    `

  Specify the GitHub username to obtain information about repositories. 
  Used when --service is github.
`
  )
  .option(
    "--github-token <token>",
    `

  Specify the GitHub Token to obtain information. 
  Used when --service is github.
`
  )
  .option(
    "--gitlab-username <username>",
    `

  Specify the GitLab username to obtain information about repositories. 
  Used when --service is gitlab.
`
  )
  .option(
    "--gitlab-token <token>",
    `

  Specify the GitLab Token to obtain information. 
  Used when --service is github.
`
  )
  .allowUnknownOption()
  .parse(process.argv);

async function run() {
  const options = program.opts();

  if (options.logLevel) {
    transports.console.level = options.logLevel;
  }
  logger.debug("List of options received: %O", options);

  let keyFile;
  if (options.keyFile) {
    setAuthKeyFile(options.keyFile);
    keyFile = options.keyFile;
  } else if (!process.env.GOOGLE_KEY_FILENAME) {
    logger.notice(
      "Not auth filename provided either by option or environamental variable. Usign default " +
        config.google.keyFile
    );
    keyFile = config.google.keyFile;
  }

  //Check if key file exists
  if (!fs.existsSync(keyFile)) {
    logger.error(
      "Auth file %s doesn't exist in directory",
      config.google.keyFile
    );
    throw new err.OptionError("Not auth file found.");
  }

  if (options.sheetId) {
    setSpreadSheetId(options.sheetId);
  } else if (!process.env.GOOGLE_SHEET_ID) {
    logger.error(
      "Spreadsheet ID is required, not provided either by an option or environmental variable."
    );
    throw new err.OptionError("Not spreadsheet ID specified");
  }

  if (options.service == null) {
    logger.error("You must specify a service name");
    throw new err.OptionError("Service name not specified");
  }

  if (!Object.keys(config.services).includes(options.service)) {
    logger.error(`Specified service ${options.service} not configured`);
    throw new err.OptionError("Service not implemented");
  }

  const credentials = {
    github: {
      username: options.githubUsername || process.env.GITHUB_USERNAME,
      token: options.githubToken || process.env.GITHUB_TOKEN,
      setUserName: github.setUserName,
      setAuthToken: github.setAuthToken,
    },
    gitlab: {
      username: options.gitlabUsername || process.env.GITLAB_USERNAME,
      token: options.gitlabToken || process.env.GITLAB_TOKEN,
      setUserName: gitlab.setUserName,
      setAuthToken: gitlab.setAuthToken,
    },
  };

  const serviceInfo = config.services[options.service];

  if (serviceInfo.type === "repository") {
    const serviceCredentials = credentials[options.service];

    if (serviceCredentials.username) {
      serviceCredentials.setUserName(serviceCredentials.username);
    } else {
      logger.error(
        serviceInfo.name +
          " username is required, not provided either by an option or environmental variable."
      );
      throw new err.OptionError(`Not ${serviceInfo.name} username specified`);
    }

    if (serviceCredentials.token) {
      serviceCredentials.setAuthToken(serviceCredentials.token);
    } else {
      logger.error(
        serviceInfo.name +
          " token is required, not provided either by an option or environmental variable."
      );
      throw new Error(`Not ${serviceInfo.name} token specified`);
    }

    logger.info(
      `Obtaining ${serviceInfo.name} repositories, the user has access`
    );
    const repos = await getAllRepositoryList(true, true, options.service);

    logger.info("Uploading repositories list to Google Sheet");
    await uploadTableFromObject(repos, serviceInfo.defaultSheetName);
  }

  logger.info("Task finished sucessfully");
  return;
}

run().catch(async (reason) => {
  logger.error("Aborting execution.");
  if (reason.name) {
    logger.error(`${reason.name}: ${reason.message}`);
  } else {
    logger.error("Unexpected error. Please report it as a bug:");
    logger.error("%O", reason);
  }

  process.exit(1);
});
