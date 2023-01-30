import wit from '../services/wit';
import loggerHelpers from '../../helpers/loggerHelpers';
export default {
  createApp: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.createApp(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  createEntity: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.createEntity(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  createExpression: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.createExpression(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  createTag: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.createTag(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  createValue: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.createValue(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  deleteApp: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.deleteApp(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  deleteEntity: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.deleteEntity(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  deleteExpression: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.deleteExpression(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  deleteSamples: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.deleteSamples(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  deleteValue: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.deleteValue(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getAllApps: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.getAllApps(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getAllTagsApp: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.getAllTagsApp(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getApp: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.getApp(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getEntities: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.getEntities(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getMessage: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.getMessage(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getSamples: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.getSamples(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getTagApp: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.getTagApp(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  trainApp: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.trainApp(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  updateApp: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.updateApp(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  updateEntity: async (req, res, next) => {
    try {
      const params = req.body;

      await wit.updateEntity(params).then((data) => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

};
