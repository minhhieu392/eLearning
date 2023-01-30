import path from 'path';
import fs from 'fs';
import Promise from '../utils/promise';
import logger from '../utils/logger';
import { ROOT_DIR } from '../utils';
// const domain = require('domain-info');
import config from '../config';

/**
 * 
 * @param {string} domainName 
 */
const testAliveDns = domainName => new Promise(resolve => {
  // eslint-disable-next-line global-require
  const dns = require('dns');
  const options = {
    family: 6,
    // eslint-disable-next-line no-bitwise
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
  };

  options.all = true;
  dns.lookup(`${domainName}`, options, (err, addresses) => {
    console.log(`addresses ${domainName}: %j`, addresses);
    // addresses: [{"address":"2606:2800:220:1:248:1893:25c8:1946","family":6}]
    if (addresses) resolve(true);
    resolve(false)
  })
})

/* const testAliveDomain = url => new Promise(resolve => {
  // eslint-disable-next-line global-require
  const needle = require('needle');
  needle.get(`${url}`, (error, response) => {
    if (error) {
      // console.log(`error: ${error.message}`)
      resolve(false)
    }
    if (response) {
      const { statusCode } = response;
      console.log(`statusCode: ${statusCode}`)
      if (statusCode === 200) resolve(true)
      resolve(false)
    }
    resolve(false)
  });
}) */

/**
 * 
 * @param {string} dir 
 * @param {string} excludeDirs 
 */
function fileList(dir, excludeDirs) {
  return fs.readdirSync(dir).reduce((list, file) => {
    const name = path.join(dir, file);

    if (fs.statSync(name).isDirectory()) {
      if (excludeDirs && excludeDirs.length) {
        // eslint-disable-next-line no-param-reassign
        excludeDirs = excludeDirs.map(d => path.normalize(d));
        const idx = name.indexOf(path.sep);
        const directory = name.slice(0, idx === -1 ? name.length : idx);

        if (excludeDirs.indexOf(directory) !== -1) return list;
      }

      return list.concat(fileList(name, excludeDirs));
    }

    return list.concat([name]);
  }, []);
}

export default app => {
  app.get("/api/c/check/domain/alive/:domainName", async (req, res) => {
    const { domainName } = req.params;
    /* const options = {
      server: 'com.whois-servers.net',
      port: 43,
      recordType: 'domain'
    }

     domain.whois(`${domainName}`, options, (error, data) => {
      // data has whois results.
      const domainData = data.trim().split('\r\n').filter(item => item !== '').map(item => item.trim())
      let checkNoMath = false;
      let dataInfo = {}
      if (domainData.length > 0 && domainData[0].toLowerCase().indexOf("no match") !== -1) {
        checkNoMath = true
      }
      if (!checkNoMath) {
        dataInfo = {
          ServerName: domainData[0].toLowerCase().split("server name: ")[1],
          Registor: domainData[1].toLowerCase().split("registrar: ")[1],
          RegistorWHOIS: domainData[2].toLowerCase().split("registrar whois server: ")[1],
          RegistorUrl: domainData[3].toLowerCase().split("registrar url: ")[1]
        }
      }
      res.send({ error, dataInfo, checkNoMath, data: domainData })
    }); */

    /* const option = {
      type: ['A', 'NS', 'MX'],
      server: { address: '8.8.8.8', port: 53, type: 'udp' },
      timeout: 1000
    }
    domain.groper(`${domainName}`, option).then(data => {
      res.send({ data })
    }) */

    /* const options = {
      host: `${domainName}`,
      port: 80,
      path: '/'
    };

    http.get(options, res1 => {
      console.log(`Got response: ${res1.statusCode}`);

      res1.on("data", chunk => {
        console.log(`BODY: ${chunk}`);
        res.send({ statusCode: res1.statusCode, body: `${chunk}` })
      });
    }).on('error', e => {
      console.log(`Got error: ${e.message}`);
      res.send({ error: `${e.message}` })
    }); */

    try {
      // Promise.try(() => {
      /* const dataHttpNoW = await testAliveDomain(`http://${domainName}`);
      log("dataHttpNoW: ", dataHttpNoW)
      if (dataHttpNoW) {
        res.send({ result: 'ok' });
        return;
      }
      const dataHttpHasW = await testAliveDomain(`http://www.${domainName}`);
      if (dataHttpHasW) {
        res.send({ result: 'ok' });
        return;
      }
      const dataHttpsNoW = await testAliveDomain(`https://${domainName}`)
      if (dataHttpsNoW) {
        res.send({ result: 'ok' });
        return;
      }
      const dataHttpsHasW = await testAliveDomain(`https://www.${domainName}`)
      if (dataHttpsHasW) {
        res.send({ result: 'ok' });
        return;
      }
      res.send({ result: 'invalid' }); */
      // res.send({ result: 'ok' });

      const dataDns = await testAliveDns(`${domainName}`);
      // log("dataHttpNoW: ", dataHttpNoW)

      if (dataDns) {
        res.send({ result: 'ok' });
        
        return;
      }
      res.send({ result: 'invalid' });
    } catch (error) {
      console.log(`error: ${error.message}`);
      const errMsg = new Error(error).message;

      logger.error(errMsg);
      res.send({ result: 'invalid' });
    }
  });

  app.get(`/api/c/get/dns`, (req, res) => {
    const path = require('path');
    const suffixFileName = `${config.WEB_DNS_FILE_CONFIG_NAME}.json`;
    let outputDir = path.resolve(`${ROOT_DIR}/userfiles/dns`)

    if (config.WEB_DIR_DNS_FILE_CONFIG_OUT !== undefined)
      outputDir = path.resolve(`${config.WEB_DIR_DNS_FILE_CONFIG_OUT}`)
    const outputFile = `${outputDir}/${suffixFileName}`;
    // eslint-disable-next-line import/no-dynamic-require
    // const dnsJson = import from (`${outputFile}`);

    res.sendFile(`${outputFile}`)
  });

  app.get('/api/c/logs', (req, res) => {
    const folderName = req.query.folder;
    const filePath = path.join(path.resolve(`${ROOT_DIR}`), '/logs/', `${folderName}`);

    res.send(fileList(filePath))
    /* fs.readdir(fileList(filePath), (err, flist) => {
      if (err) return next(err);
      res.send(flist);
    }); */
  });

  app.post('/api/c/logs/download', (req, res) => {
    const { filePath } = req.body;
    // res.download(path.join(__dirname, "/downloads/report.pdf"));

    res.download(path.resolve(`${filePath}`));
  });
}
