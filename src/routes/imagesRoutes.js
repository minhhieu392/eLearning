import fs from 'fs';
import Promise from '../utils/promise';
import CONFIG from '../config';

/**
 * 
 * @param {*} fileImage 
 */
const readImageFile = fileImage => new Promise((resolve, reject) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const starts = fs.statSync(fileImage);

    console.log(`Image ${fileImage} exists.`);
    fs.readFile(fileImage, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  } catch (error) {
    reject(error);
  }

});

/**
 * 
 * @param {*} filename 
 */
/* function getExtension(filename) {
  const i = filename.lastIndexOf('.');

  return i < 0 ? '' : filename.substr(i);
} */

/**
 * 
 * @param {*} filename 
 */
function getPath(filename) {
  const i = filename.lastIndexOf('/');

  return i < 0 ? '' : filename.substring(0, i);
}

/**
 * 
 * @param {*} filename 
 */
function getName(filename) {
  const i = filename.lastIndexOf('/');

  return i < 0 ? '' : filename.substr(i);
}

export default app => {
  app.get("/get_images/*", async (req, res) => {
    /* const MobileDetect = require('mobile-detect');
    const md = new MobileDetect(req.headers['user-agent']); */
    const Jimp = require('jimp');
    const imagePath = req.path.split('get_images')[1];

    let widthImage; let widthDevice;
    // let quality = 50;

    if (req.query.widthImage && !isNaN(req.query.widthImage)) {
      widthImage = Number(req.query.widthImage);
    }
    if (req.query.widthDevice && !isNaN(req.query.widthDevice)) {
      widthDevice = Number(req.query.widthDevice);
    }
    /* if (md.mobile()) {
      quality = 9;
    } */
    console.log("widthDevice %o widthImage %o | imageNewPath: %o | imageName: %o", widthDevice, widthImage, getPath(imagePath), getName(imagePath));
    let fileImage = `${CONFIG.WEB_DIR_IMAGE_RELATED}${imagePath}`; let fileUrlImage = `${imagePath}`;

    // const imageExt = getExtension(imagePath);
    const imageTempPath = `${getPath(imagePath)}/${widthImage}`;
    const imageName = getName(imagePath);
    const imageNewPath = `${imageTempPath}${imageName}`;

    if (widthImage > 0) {
      fileImage = `${CONFIG.WEB_DIR_IMAGE_RELATED}${imageNewPath}`;
      fileUrlImage = `${imageNewPath}`;
    }

    console.log("fileImage: %o", fileImage)
    try {
      const fs = require("fs");
      // eslint-disable-next-line no-unused-vars
      const stats = fs.statSync(fileImage);

      console.log("Image exists.");
      try {
        res.send({ url: `${CONFIG.IMAGE_SERVER}${fileUrlImage}` })
        /* readImageFile(fileImage).then(data => {
          var img = new Buffer(data, 'base64');
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length,
            "Cache-Control": "public, max-age=7776000",
            "Expires": new Date(Date.now() + 7776000000).toUTCString()
          });
          res.end(img);
        }) */
      } catch (error) {
        console.log("Image exists error: ", error);
      }
    } catch (e) {
      console.log("Image does not exist => e: ", new Error(e).message);

      const filebase64 = await Jimp.read(`${CONFIG.WEB_DIR_IMAGE_RELATED}${imagePath}`).then(image => {
        try {
          if (widthImage) {
            console.log("widthImage: ", widthImage)
            image.resize(widthImage, Jimp.AUTO);
          }
          // image.quality(quality);
        } catch (error) {
          console.log("error resize: ", error)
        }
        // image.write(fileImage);
        // return image.getBase64Async(Jimp.MIME_PNG);

        return image;
      }).catch(err => {
        console.log("Jimp catch: ", err)
      });

      if (filebase64) {
        filebase64.write(fileImage);
      }

      res.send({ url: `${CONFIG.IMAGE_SERVER}${fileUrlImage}` })
    }
  })

  app.get('/api/c/images/*', (req, res, next) => {
    try {
      console.log("req path: ", req.path)
      let imagePath = req.path.replace(/\/+\//g, '/');

      imagePath = imagePath.replace("/api/c/images/", "");

      readImageFile(`${CONFIG.WEB_DIR_IMAGE_RELATED}${imagePath}`).then(data => {
        const img = Buffer.from(data, 'base64');

        console.log("img: ", img)
        res.writeHead(200, {
          'Content-Type': `image/*`,
          'Content-Length': img.length,
          "Cache-Control": "public, max-age=7776000",
          Expires: new Date(Date.now() + 7776000000).toUTCString()
        });
        res.end(img);
      }).catch(error => {
        console.log("errorfdff: ", error)
        next(error)
      })

      /* fs.readFile(`${CONFIG.WEB_DIR_IMAGE_RELATED}${imagePath}`, (err, data) => {
        if (err) {
          console.log("err: ", err)
          next(err)
        } else {
          res.send("fdf")
        }
      }); */
    } catch (error) {
      console.log("errordfdfd catch: ", error)
      next(error)
    }
  })
}
