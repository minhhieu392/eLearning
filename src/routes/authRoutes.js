import MenuService from '../services/menuService';

import logger from '../utils/logger';
import _ from 'lodash';
import { codeMessage } from '../utils/index';
import { parseSort } from '../utils/helper';
import models from '../entity';
import Model from '../models/models';
const { userGroupRoles, menus, users } = models;

export default app => {
  app.get('/api/c/auth_routes', async (req, res, next) => {
    try {
      const { getUserId } = require('../utils');
      const id = getUserId(req.headers['x-auth-key']);

      if (id === -9999) {
        res.send({
          result: null,
          success: false,
          errors: [],
          messages: []
        });

        return;
      }
      const Obejctuser = await Model.findOne(users, {
        where: { id: id }
      });

      console.log('req.auth: ', req.auth);
      const { sort, range, filter, filterChild } = req.query;
      const filterWithI18n = filter ? Object.assign(JSON.parse(filter)) : {};
      const param = {
        // sort: sort ? JSON.parse(sort) : [["parentId", "asc"], ["orderBy", "asc"]],
        sort: parseSort(sort),
        range: range ? JSON.parse(range) : [0, 50],
        filter: filterWithI18n,
        filterChild: filterChild ? JSON.parse(filterChild) : { userGroupsId: Obejctuser.userGroupsId, isViewed: true },
        auth: req.auth
      };
      console.log(param);
      MenuService.get_menu(param)
        .then(data => {
          console.log('aaa', JSON.stringify(data));
          res.send({
            result: {
              list: data.rows,
              pagination: {
                page: data.page,
                pageSize: data.perPage,
                total: data.count
              }
            },
            success: true,
            errors: [],
            messages: []
          });
        })
        .catch(err => {
          console.log('err: ', err);
          const { statusCode, code, error } = err;
          const { message } = new Error(error[0]);
          const messages = error.map(item => new Error(item).message);

          logger.error(messages.join(','));
          res.status(statusCode || 202).send({
            result: null,
            success: false,
            errors: [{ code, message }],
            messages
          });
        });
    } catch (error) {
      const code = 1500;
      const errCode = 202;
      const errMsg = new Error(error).message;

      logger.error(errMsg);
      res.status(errCode).send({
        result: [],
        pagination: {},
        success: false,
        errors: [{ code, message: codeMessage[code] }],
        messages: [errMsg]
      });
    }
  });

  app.get('/api/c/auth_roles', async (req, res) => {
    try {
      // console.log("auth_roles req.params: ", req.query)
      const { filter } = req.query;
      const { getUserId } = require('../utils');
      const id = getUserId(req.headers['x-auth-key']);

      if (id === -9999) {
        res.send({
          result: null,
          success: false,
          errors: [],
          messages: []
        });

        return;
      }
      // console.log("auth_roles id: ", id)
      // console.log("auth_roles filter: ", filter)

      const Obejctuser = await Model.findOne(users, {
        where: { id: id }
      });

      let filterWithI18n = filter ? JSON.parse(filter) : {};
      // console.log("filterWithI18n=",filterWithI18n)
      const { sitesId } = filterWithI18n;

      filterWithI18n = {
        userGroupsId: Obejctuser.userGroupsId
      };
      console.log('sitesId=', sitesId);
      const param = {
        where: filterWithI18n,
        order: [['id', 'asc']],
        logging: true,
        include: [
          { model: menus, as: 'menus', require: true, where: { sitesId: sitesId || 1 }, attributes: ['id', 'name'] }
        ]
      };

      Model.findAll(userGroupRoles, param)
        .then(data => {
          // console.log("auth_roles param: %o \n data: ", param, data)
          res.send({
            result: {
              list: data
            },
            success: true,
            errors: [],
            messages: []
          });

          return;
        })
        .catch(error => {
          const code = 1500;
          const errCode = 500;
          const errMsg = new Error(error).message;

          logger.error(errMsg);
          res.status(errCode).send({
            result: null,
            success: false,
            errors: [{ code, message: codeMessage[code] }],
            messages: [errMsg]
          });
        });
    } catch (error) {
      const code = 1500;
      const errCode = 500;
      const errMsg = new Error(error).message;

      logger.error(errMsg);
      res.status(errCode).send({
        result: null,
        success: false,
        errors: [{ code, message: codeMessage[code] }],
        messages: [errMsg]
      });
    }
  });
};
