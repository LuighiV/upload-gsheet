# Script to upload info to Google Sheets

## Requirements

**NOTE** This information is taken from the google-api documentation for nodejs
 from: https://github.com/googleapis/google-api-nodejs-client#service-account-credentials

### Create a service account

Service accounts allow you to perform server to server, app-level authentication using a robot account. You will create a service account, download a keyfile, and use that to authenticate to Google APIs. To create a service account:

- Go to the [Create Service Account Key page](https://console.cloud.google.com/apis/credentials/serviceaccountkey)
- Click the button `Create new service account` 
- Enter the service account name and the corresponding id.
- Add the additional information regarding users and project permissions
	(optional)
- Create the service account.

Once it is created you should create a keyfile, then follow the next steps:
- Enter to the newly created service account
- Go to the `Keys` tab
- Click the button `Add key` and select `JSON`.

Save the service account credential file somewhere safe, and do not check this file into source control!

### Add permissions to the document

If you want to perform operations in a private file, you should add the service
mail (e.g. service-name@project-name.iam.gserviceaccount.com) to the list of
shared users in your document.

You can read this reference which explains this specific requirement:
https://github.com/juampynr/google-spreadsheet-reader


## How to use

The script could be used installed in your local environment, or directly from the
location of the package source.

If you have installed it, the command name is `upload-gsheet` and admits the next
options:

```
upload-gsheet [options]
```

**Options:**

* `-V, --version` output the version number
* `-l, --log-level <level>` 

    Specify the log-level, by default info.
    Possible values: error, warning, notice, info, debug

* `--sheet-id <id>`

    Specify the Spreadsheet ID which serves to update data.
    Also, can be specified by environmental variable `GOOGLE_SHEET_ID`

* `--key-file <filename>`

    Specify the key filename to authenticate with Google service.
    By default, it is `key.json`.

* `-s, --service <service>`

    Specify the service name from which obtain the data to upload.
    The available option is: `github`

* `--github-username <username>`

    Specify the GitHub username to obtain information about repositories.
    Used when `--service` is `github`.

* `--github-token <token>`

    Specify the GitHub Token to obtain information.
    Used when `--service` is `github`.

*  `-h, --help` display help for command

From these options, providing the `--sheet-id` is mandatory either via the
command line or via an environmental variable `GOOGLE_SHEET_ID`.

Then, it is required also that you provide the key file downloaded from the Google
service account, explained above.

In case you are using the script from the source folder, you can call it via:
```
npm run upload -- [options]
```

Where `[options]` are the options described above.

## Available services

### GitHub

To use this service, it requires some environment variables set:

| Variable name   | Description                                 |
| -------------   | ------------                                |
| GITHUB_TOKEN    | API token to obtain information from GitHub |
| GITHUB_USERNAME | GitHub user to obtain repositories info     |

These variables are required to obtain the user repositories information from
GitHub. If not set, this information can also be specified via the command line
options `--github-token` and `--github-username`, respectively.
