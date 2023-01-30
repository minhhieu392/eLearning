/* eslint-disable camelcase */

import _ from 'lodash';
import Model from '../models/models';

/*
exampTree   :
                            1a                                          1b
                        |       |                                   |       |
                      2a          2b                              2c          2d
                  |       |           |                           |         |      |
                3a       3b            3c                        3d       3e        3f
                         |                                                          |
                         4a                                                         4b

*/

/* getParent_ForOne
input : 3b
output:  3b   --parent--> 2a  --parent--> 1a
         {...3b,3b.parent = 2a,  2a.parent = 1a  }
*/
const getParent_ForOne = (
  current,
  model,
  { attributes = null, include = null, otherWhere = {} },
  parentName,
  childName
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log('getParent_ForOne', model);

      if (current[`${childName}`] && Number(current[`${parentName}`]) !== 0) {
        const whereFillTer = {};

        whereFillTer[`${childName}`] = current[`${parentName}`];
        // console.log('whereFillTer Parent', { ...whereFillTer, ...otherWhere });
        let dataParent = await Model.findOne(model, {
          where: { ...whereFillTer, ...otherWhere },
          attributes: attributes,
          include: include
        }).catch(error => {
          console.log('err', error);
        });

        if (dataParent) {
          current.dataValues.parent = [];
          dataParent = await getParent_ForOne(
            dataParent,
            model,
            { attributes, include, otherWhere },
            parentName,
            childName
          );
          current.dataValues.parent.push(dataParent);
        }

        // console.log("arrayChild=======",arrayChild)
      }

      return resolve(current);
    } catch (error) {
      reject(error);
    }
  });
};

// tương tự getParent_ForOne , thêm 1 bước là kiểm tra đã có parent trong checkObject chưa
// dùng để lấy parent cho nhiều phần tử riêng biêt và tránh gọi lại databse khi đã lấy parent từ lần trước
const getParent_ForOne_check = (
  current,
  model,
  checkObject = {},
  { attributes = null, include = null, otherWhere = {} },
  parentName,
  childName
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log('getParent_ForOne_check', model);

      if (current[`${childName}`] && Number(current[`${parentName}`]) !== 0) {
        const whereFillTer = {};

        if (checkObject[current[`${parentName}`]]) {
          console.log('đã có parent ', current[`${parentName}`]);
          current.dataValues.parent = current.dataValues.parent || [];
          current.dataValues.parent.push(checkObject[current[`${parentName}`]]);
        } else {
          whereFillTer[`${childName}`] = current[`${parentName}`];
          // console.log('whereFillTer Parent', { ...whereFillTer, ...otherWhere });
          let dataParent = await Model.findOne(model, {
            where: { ...whereFillTer, ...otherWhere },
            attributes: attributes,
            include: include
          }).catch(error => {
            console.log('err', error);
          });

          if (dataParent) {
            current.dataValues.parent = [];
            dataParent = await getParent_ForOne_check(
              dataParent,
              model,
              checkObject,
              { attributes, include, otherWhere },
              parentName,
              childName
            );
            current.dataValues.parent.push(dataParent);
          }
        }
        // console.log("arrayChild=======",arrayChild)
      }
      checkObject[current[`${childName}`]] = _.omit(current.dataValues, ['children']);

      return resolve(current);
    } catch (error) {
      reject(error);
    }
  });
};
/* getChildren_ForOne
output:  2d   --children--> 3e
              --children--> 3f  --children--> 4b

         {...2d, 2d.children = [3e,3f],  3f.children = 4b  }
*/
const getChildren_ForOne = (
  current,
  model,
  { attributes = null, include = null, otherWhere = {} },
  parentName,
  childName
) => {
  // console.log('getChildren_ForOne', model);

  return new Promise(async (resolve, reject) => {
    try {
      if (current[`${childName}`]) {
        const whereFillTer = {};

        whereFillTer[`${parentName}`] = current[`${childName}`];
        // console.log('attributes1');
        // console.log('attributes1', attributes);
        // console.log('whereFillTer', { ...whereFillTer, ...otherWhere });
        const dataListChild = await Model.findAll(model, {
          where: { ...whereFillTer, ...otherWhere },
          attributes: attributes,
          include: include
        }).catch(error => {
          console.log('err', error);
        });

        if (dataListChild.length > 0) {
          current.dataValues.children = [];
          await Promise.all(
            dataListChild.map(async element => {
              element = await getChildren_ForOne(
                element,
                model,
                { attributes, include, otherWhere },
                parentName,
                childName
              );
              current.dataValues.children.push(element);
            })
          );
        }

        // console.log("arrayChild=======",arrayChild)
      }

      return resolve(current);
    } catch (error) {
      reject(error);
    }
  });
};

const getChildren_ForOne_check = (
  current,
  model,
  checkObject = {},
  { attributes = null, include = null, otherWhere = {} },
  parentName,
  childName
) => {
  // console.log('getChildren_ForOne_check', model);

  return new Promise(async (resolve, reject) => {
    try {
      if (current[`${childName}`]) {
        const whereFillTer = {};

        whereFillTer[`${parentName}`] = current[`${childName}`];
        // console.log('attributes1');
        // console.log('attributes1', attributes);
        // console.log('whereFillTer', { ...whereFillTer, ...otherWhere });
        const dataListChild = await Model.findAll(model, {
          where: { ...whereFillTer, ...otherWhere },
          attributes: attributes,
          include: include
        }).catch(error => {
          console.log('err', error);
        });

        if (dataListChild.length > 0) {
          current.dataValues.children = [];
          await Promise.all(
            dataListChild.map(async element => {
              if (checkObject[element[`${childName}`]]) {
                console.log('dã có Child', element[`${childName}`]);
                current.dataValues.children.push(checkObject[element[`${childName}`]]);
              } else {
                element = await getChildren_ForOne_check(
                  element,
                  model,
                  checkObject,
                  { attributes, include, otherWhere },
                  parentName,
                  childName
                );
                current.dataValues.children.push(element);
              }
            })
          );
        }

        // console.log("arrayChild=======",arrayChild)
      }
      checkObject[current[`${childName}`]] = _.omit(current.dataValues, ['parent']);

      return resolve(current);
    } catch (error) {
      reject(error);
    }
  });
};

/*  getChildren_notCheck  : đầu vào là các nốt không cùng 1 nhánh => không cần kiểm tra đã tìm thấy chưa
input : [2a,2d ]
output:  2d   --children--> 3e
              --children--> 3f  --children--> 4b

         2a   --children--> 3a
              --children--> 3b  --children--> 4a

        [
          {...2d, 2d.children = [3e,3f],  3f.children = 4b  },
          {...2a, 2a.children = [3a,3b],  3b.children = 4b  }
        ]
*/
const getChildren_notCheck = (
  current = [],
  model,
  { attributes = null, include = null, otherWhere = {} },
  parentName,
  childName
) => {
  // console.log('getChildren_notCheck', model);

  return new Promise(async (resolve, reject) => {
    try {
      if (current.length > 0) {
        current = await Promise.all(
          current.map(async currentElement => {
            const whereFillTer = {};

            whereFillTer[`${parentName}`] = currentElement[`${childName}`];
            // console.log('whereFillTer', whereFillTer, parentName);
            // console.log('where', { ...whereFillTer, ...otherWhere });
            const dataListChild = await Model.findAll(model, {
              where: { ...whereFillTer, ...otherWhere },
              attributes: attributes,
              include: include
            }).catch(error => {
              console.log('err', error);
            });

            if (dataListChild && dataListChild.length > 0) {
              // console.log('length', dataListChild.length);
              currentElement.dataValues.children = [...dataListChild];
              await getChildren_notCheck(
                dataListChild,
                model,
                { attributes, include, otherWhere },
                parentName,
                childName
              );
            }
          })
        );
      }
      // console.log("arrayChild=======",arrayChild)

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

/* getParent_Tree_ForOne_check
input : current =4a
        checkObject : 2a              // đã có dữ liệu của 2a
output:  4a --parent--> 3b  --parent--> 2a  (checkObject = true) -> dừng lại
         {...4a,4a.parent = 3b,3b.parent = 2a, ...2a }
*/
const getParent_Tree_ForOne_check = (
  current,
  model,
  checkObject = {},
  { attributes = null, include = null, otherWhere = {} },
  result,
  parentName,
  childName
) => {
  // console.log('getParent_Tree_ForOne_check', model);

  return new Promise(async (resolve, reject) => {
    try {
      // console.log("dffffffffffffffffffffffff",array)

      if (current[`${childName}`]) {
        if (Number(current[`${childName}`]) === 0) {
          result.push(current);
        } else if (checkObject[`${current[`${parentName}`]}`]) {
          checkObject[`${current[parentName]}`].dataValues.children =
            checkObject[`${current[parentName]}`].dataValues.children || [];
          checkObject[`${current[parentName]}`].dataValues.children.push(current);
        } else {
          const whereFillTer = {};

          whereFillTer[`${childName}`] = current[`${parentName}`];
          // console.log('whereFillTer Parent', whereFillTer);
          const dataParent = await Model.findOne(model, {
            where: { ...whereFillTer, ...otherWhere },
            attributes: attributes,
            include: include
          }).catch(error => {
            console.log('err', error);
          });

          if (!dataParent || !dataParent[`${childName}`]) {
            result.push(current);
          } else {
            dataParent.dataValues.children = [];
            dataParent.dataValues.children.push(current);
            checkObject[`${dataParent[childName]}`] = dataParent;
            await getParent_Tree_ForOne_check(
              dataParent,
              model,
              checkObject,
              { attributes, include, otherWhere },
              result,
              parentName,
              childName
            );
          }
        }

        // console.log("arrayChild=======",arrayChild)

        return resolve(true);
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getChildren_Tree_ForOne_check = (
  current,
  model,
  checkObject = {},
  { attributes = null, include = null, otherWhere = {} },
  result = {},
  parentName,
  childName
) => {
  // console.log('getChildren_Tree_ForOne_check', model);

  return new Promise(async (resolve, reject) => {
    try {
      // console.log("dffffffffffffffffffffffff",array)
      // console.log('getChildren_Tree_ForOne_check');
      // console.log('current', JSON.stringify(current));
      if (current[`${childName}`]) {
        const whereFillTer = {};

        whereFillTer[`${parentName}`] = current[`${childName}`];
        // console.log('whereFillTer Parent', whereFillTer);
        let dataChildren = await Model.findAll(model, {
          where: { ...whereFillTer, ...otherWhere },
          attributes: attributes,
          include: include
        }).catch(error => {
          console.log('err', error);
        });

        if (dataChildren || !dataChildren.length > 0) {
          current.dataValues.children = current.dataValues.children || [];
          dataChildren = await Promise.all(
            dataChildren.map(async childrenElement => {
              if (checkObject[`${childrenElement[childName]}`]) {
                delete result[`${childrenElement[childName]}`];
              } else {
                checkObject[`${childrenElement[childName]}`] = childrenElement;
                const chidrenResult = await getChildren_Tree_ForOne_check(
                  childrenElement,
                  model,
                  checkObject,
                  { attributes, include, otherWhere },
                  result,
                  parentName,
                  childName
                );

                if (chidrenResult && chidrenResult.length > 0) {
                  childrenElement.dataValues.children = chidrenResult;
                }
              }
              current.dataValues.children.push(checkObject[`${childrenElement[childName]}`]);

              return childrenElement;
            })
          );

          return resolve(dataChildren);
        } else {
          return resolve(null);
        }

        // console.log("arrayChild=======",arrayChild)
      }
    } catch (error) {
      reject(error);
    }
  });
};

/* getParent_Tree
   input : 2a,2d , 4a 3f
     b1: kiểm tra cha con  => checkObject = {2a,2d,4a,3f}

     b2: newArray.map => gọi getParent_Tree_ForOne_check
        ...4a input : current =4a
                checkObject : 2a              // đã có dữ liệu của 2a
              output:  4a --parent--> 3b  --parent--> 2a  (checkObject = true) -> dừng lại
                 {...4a,4a.parent = 3b,3b.parent = 2a, ...2a }
        ...2a,
        ...2d
*/
const getParent_Tree = (
  current = [],
  model,
  checkObject = {},
  { attributes = null, include = null, otherWhere = {} },
  result = [],
  parentName,
  childName
) => {
  // console.log('getParent_Tree', model);

  return new Promise(async (resolve, reject) => {
    try {
      if (current.length > 0) {
        // current.forEach(currentElement => {
        //   checkObject[currentElement[childName]] = currentElement;
        // });
        // console.log('checkObject', checkObject);
        current = await Promise.all(
          current.map(async currentElement => {
            currentElement.dataValues.filterStatus = true;
            checkObject[currentElement[childName]] = currentElement;
            await getParent_Tree_ForOne_check(
              currentElement,
              model,
              checkObject,
              { attributes, include, otherWhere },
              result,
              parentName,
              childName
            );

            return true;
          })
        );
      }
      // console.log("arrayChild=======",arrayChild)

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const getChildren_Tree = (
  current = [],
  model,
  checkObject = {},
  { attributes = null, include = null, otherWhere = {} },
  result = {},
  parentName,
  childName
) => {
  // console.log('getChildren_Tree', model);

  return new Promise(async (resolve, reject) => {
    try {
      // console.log('resulut', result);
      // console.log('parentName', parentName);
      // console.log('childName', childName);
      if (current.length > 0) {
        // current.forEach(currentElement => {
        //   checkObject[currentElement[childName]] = currentElement;
        // });
        // console.log('checkObject', checkObject);
        await Promise.all(
          current.map(async currentElement => {
            checkObject[`${currentElement[childName]}`] = currentElement;

            result[`${currentElement[childName]}`] = currentElement;
            currentElement.dataValues.filterStatus = true;

            const chidrenElement = await getChildren_Tree_ForOne_check(
              currentElement,
              model,
              checkObject,
              { attributes, include, otherWhere },
              result,
              parentName,
              childName
            );

            if (chidrenElement && chidrenElement.length > 0) {
              currentElement.dataValues.children = chidrenElement;
            }

            return true;
          })
        );
      }
      // console.log('arrayChild=======', JSON.stringify(current));

      resolve(Object.values(result));
    } catch (error) {
      reject(error);
    }
  });
};
const getTree = async (
  current = [],
  model,
  checkObject = {},
  { attributes = null, include = null, otherWhere = {} },
  result = [],
  parentName,
  childName
) => {
  await Promise.all([
    getChildren_Tree(current, model, checkObject, { attributes, include, otherWhere }, {}, parentName, childName),
    getParent_Tree(current, model, checkObject, { attributes, include, otherWhere }, result, parentName, childName)
  ]);

  return;
};

const getTree_notConnection_databse = (current, dataArray = [], parentName, childName) => {
  // console.log('getTree_notConnection_databse');

  // current = { dataValues : {} , 'childName':''0}

  let childrenArray = [];

  if (dataArray.length > 0) {
    childrenArray = dataArray.filter(element => {
      if (Number(element[parentName]) === Number(current[childName])) {
        getTree_notConnection_databse(element, dataArray, parentName, childName);

        return true;
      }

      return false;
    });

    if (childrenArray.length > 0) {
      current.dataValues.children = [];
      current.dataValues.children.push(...childrenArray);
    }
  }

  return current.dataValues.children;
};

const convert_array_to_object = (dataArray = [], findDataArray = [], parentName, childName, whereFilter = {}) => {
  const resultObject = {};
  const resultObject_sortBy_parentName = {};
  const resultArray = [];

  dataArray.forEach(dataElement => {
    dataElement.index = -1;
    resultObject[dataElement[childName]] = dataElement;
    resultObject_sortBy_parentName[dataElement[parentName]] =
      resultObject_sortBy_parentName[dataElement[parentName]] || [];
    resultObject_sortBy_parentName[dataElement[parentName]].push(dataElement);
  });
  findDataArray.forEach(findData => {
    resultArray.push(findData);
  });

  return { resultObject, resultObject_sortBy_parentName, resultArray };
};
const getTree_getAllFromDB = (
  dataObjec = {},
  checkedObject = {},
  dataObject_by_parentName = {},
  findDataArray = [],
  parentName,
  childName
) => {
  // console.log('getTree_getAllFromDB');
  const result = [];
  const newFindDataArray = [];

  findDataArray.forEach(dataElement => {
    dataElement.index += 1;
    result.push(dataObjec[dataElement[childName]]);
    checkedObject[dataElement[childName]] = dataObjec[dataElement[childName]];
    if (dataObject_by_parentName[dataElement[childName]]) {
      newFindDataArray.push(...dataObject_by_parentName[dataElement[childName]]);
      dataObjec[dataElement[childName]].children = dataObject_by_parentName[dataElement[childName]];
      delete dataObject_by_parentName[dataElement[childName]];
    }
    // delete dataObjec[dataElement[childName]];
  });

  if (newFindDataArray.length > 0)
    getTree_getAllFromDB(dataObjec, checkedObject, dataObject_by_parentName, newFindDataArray, parentName, childName);

  return result;
};

export default {
  getChildren_ForOne,
  getChildren_notCheck,
  getParent_ForOne,
  getTree,
  getParent_Tree,
  getChildren_Tree,
  getParent_ForOne_check,
  getChildren_ForOne_check,
  getTree_notConnection_databse,
  getTree_getAllFromDB,
  convert_array_to_object
};
