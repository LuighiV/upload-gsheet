function objectToList(objectList, keys) {
  return objectList.map((element) => {
    return keys.map((k) => {
      if (k instanceof Object) {
        return k["keys"].map((item) => element[k["root"]][item]);
      }
      return element[k];
    });
  });
}

function keysToList(keys) {
  return keys.map((key) => {
    if (key instanceof Object) {
      return key["keys"].map((k) => [key["root"], k].join("_"));
    }
    return key;
  });
}

function flatListItems(list) {
  return list.map((item) => {
    if (item instanceof Array) {
      return item.flat();
    }
    return item;
  });
}
module.exports = {
  objectToList,
  keysToList,
  flatListItems,
};
