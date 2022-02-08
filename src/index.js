#!/usr/bin/env node
const { logger, transports } = require("./logger");
const Commander = require("commander");
const {
  getRepositoryList,
  getRepositoryListFromOrganizations,
} = require("./scripts/download-data");
const { uploadTableFromObjectList } = require("./scripts/upload-data");
const { setSpreadSheetId, setAuthKeyFile } = require("./gsheet");
const packageJson = require("../package.json");
const { setUserName, setAuthToken } = require("./github");
const config = require("./config");
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
  try {
    if (!fs.existsSync(keyFile)) {
      logger.error(
        "Auth file %s doesn't exist in directory",
        config.google.keyFile
      );
      throw new Error("Not auth file found");
    }
  } catch (err) {
    console.error(err);
  }

  if (options.sheetId) {
    setSpreadSheetId(options.sheetId);
  } else if (!process.env.GOOGLE_SHEET_ID) {
    logger.error(
      "Spreadsheet ID is required, not provided either by an option or environmental variable."
    );
    throw new Error("Not spreadsheet ID specified");
  }

  if (options.service == null) {
    logger.error("You must specify a service name");
    throw new Error("Service name not specified");
  }

  if (!Object.keys(config.services).includes(options.service)) {
    logger.error(`Specified service ${options.service} not configured`);
    throw new Error("Service not implemented");
  }

  if (options.service === "github") {
    if (options.githubUsername) {
      setUserName(options.githubUsername);
    } else if (!process.env.GITHUB_USERNAME) {
      logger.error(
        "GitHub username is required, not provided either by an option or environmental variable."
      );
      throw new Error("Not GitHub username specified");
    }

    if (options.githubToken) {
      setAuthToken(options.githubToken);
    } else if (!process.env.GITHUB_TOKEN) {
      logger.error(
        "GitHub token is required, not provided either by an option or environmental variable."
      );
      throw new Error("Not GitHub token specified");
    }

    logger.info("Obtaining own repositories");
    const own = await getRepositoryList();

    logger.info("Obtaining repositories from organizations");
    const org = await getRepositoryListFromOrganizations();

    const total = [own].concat(org);
    logger.info("Uploading repositories list to Google Sheet");
    await uploadTableFromObjectList(total, "github");
  }

  return;
}

run().catch(async (reason) => {
  logger.error("Aborting execution.");
  if (reason.command) {
    logger.error(`${reason.command} has failed.`);
  } else {
    logger.error("Unexpected error. Please report it as a bug:");
    logger.error("%O", reason);
  }

  process.exit(1);
});
