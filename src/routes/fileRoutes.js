import fsExtra from 'fs-extra';
import fs from 'fs';
import path from 'path';
import Mustache from 'mustache';
import moment from 'moment';
import { codeMessage } from '../utils';
import logger from '../utils/logger';

const handleFileConfigServer = ({ input, output }) => new Promise((resolve, reject) => {
  try {
    const customTags = ['@@', '@@'];

    Mustache.tags = customTags;

    fs.readFile(input.tempFile, function (error, dataTemplate) {
      if (error) {
        // console.log({ err: error });
        reject({
          code: 1500,
          error
        })
      }
      else {
        const templates = new Buffer(dataTemplate).toString();
        const outputData = Mustache.render(templates, input.data);

        fsExtra.ensureDir(output.outputDir).then(() => {
          fs.writeFile(output.outputFile, outputData, function (error) {
            if (error) {
              // console.log({ err: error });
              reject({
                code: 1500,
                error
              })
            }
            else {
              resolve(outputData)
            }
          });
        }).catch(error => {
          // console.error(error)
          reject({
            code: 1500,
            error
          })
        })
      }
    })
  } catch (error) {
    reject({
      code: 1500,
      error
    })
  }
})

export default app => {
  app.get('/api/handle/files', (req, res) => {
    logger.log({
      level: 'info',
      message: `${req.originalUrl} - ${req.method} - ${req.ip} - ${JSON.stringify(req.query)}`
    });

    try {
      const view = {
        domain_master: "abc.vn",
        upstream_server: "3000",
        upstream_port: "2000",
        upstream_weight: "10",
        addon_domain: "abc.com",
        addon_domain_ssl_crt: "fddfsdf"
      };
      const view2 = {
        domain_master: "abc.vn",
        upstream_uri: "",
        host_header: "",
        x_forwarded_for: "",
        gzip: "",
        gzip_comp_level: "",
      }
      const outputDir = path.resolve(`${process.env.WEB_DIR_FILE_CONFIG_SERVER_OUT}/config`)
      const outputFile = `${outputDir}/${moment().format("YYYYMMDDHHMMSSS")}.site_name.kcdn.vn.conf`;
      const tempFile = path.resolve(`${process.env.WEB_DIR_FILE_CONFIG_SERVER_TEMPLATE}/site_name.kcdn.vn.conf`);

      handleFileConfigServer({
        input: {
          tempFile,
          data: view
        },
        output: {
          outputDir,
          outputFile
        }
      }).then(result => {
        res.send({
          result,
          success: true,
          errors: [],
          messages: []
        })
      }).catch(error => {
        logger.logError(req, errMsg);

        const code = error.code;
        const errCode = error.code.toString().slice(1)
        const errMsg = new Error(error).message;

        res.status(errCode).send({
          result: [],
          success: false,
          errors: [{ code, message: codeMessage[code] }],
          messages: [errMsg]
        })
      })
    } catch (error) {
      logger.logError(req, errMsg);

      const code = 1500;
      const errCode = 202;
      const errMsg = new Error(error).message;

      res.status(errCode).send({
        result: [],
        success: false,
        errors: [{ code, message: codeMessage[code] }],
        messages: [errMsg]
      })
    }
  })
}
