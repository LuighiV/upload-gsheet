const gapi = require("../gsheet");
const { logger } = require("../logger");
const ddata = require("./download-data");

async function uploadTableFromList(list, sheetname) {
  sheets = await gapi.getTables();
  logger.debug(sheets);

  if (!sheets.includes(sheetname)) {
    logger.warning("sheet '" + sheetname + "' not in spreadsheet. Creating it");
    response = await gapi.createTable(sheetname);
    logger.debug(response);
  }

  response = await gapi.resetTableValues(sheetname, list);
  logger.debug(response);
  return;
}
async function uploadTableFromObject(
  listObj,
  sheetname,
  tablename,
  withheader = true,
  keysName = "keys",
  valuesName = "values"
) {
  info = withheader
    ? [listObj[keysName]].concat(listObj[valuesName])
    : listObj[keysName];

  return uploadTableFromList(info, sheetname);
}

async function uploadTableFromObjectList(
  listObj,
  sheetname,
  tablename,
  withheader = true,
  keysName = "keys",
  valuesName = "values"
) {
  onlyData = listObj.map((obj) => obj[valuesName]).flat();
  keys = listObj[0][keysName];
  info = withheader ? [keys].concat(onlyData) : onlyData;

  return uploadTableFromList(info, sheetname);
}

//(async () => {
//  await uploadTableFromObject(
//    { keys: ["id", "name"], values: [[1, "Luighi"]] },
//    "github"
//  );
//})();

module.exports = {
  uploadTableFromList,
  uploadTableFromObject,
  uploadTableFromObjectList,
};
