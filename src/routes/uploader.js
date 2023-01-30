import config from '../config'
import path from 'path'
import fs from 'fs-extra'
import moment from 'moment'
import { datetimeNowString } from '../utils';
import Promise from '../utils/promise';

export default (app, upload, uploadVideo) => {
  /* BEGIN NEW UPLOAD IMAGE */
  app.post('/photos/uploadHandler', upload.single('file'), (req, res, next) => {
    Promise.try(() => {
      // console.log("process.env.WEB_DIR_IMAGE ", process.env.WEB_DIR_IMAGE)
      // const configDir = path.resolve(process.env.WEB_DIR_IMAGE)
      let objReturn;

      if (req.file && req.file.originalname) {
        const { file } = req;
        const dirPath = path.resolve(file.path).replace(/\\/g, "/")
        const dirRelativePath = `${dirPath.replace(new RegExp(config.WEB_DIR_IMAGE_RELATED), '')}`

        objReturn = { originalname: file.originalname, mimetype: file.mimetype, size: file.size, filename: file.filename, path: dirRelativePath }
      }
      console.log("objReturn ", objReturn)
      res.send(objReturn)
    }).catch(error => {
      next(error)
    })
  })
  /* END NEW UPLOAD IMAGE */

  /* BEGIN UPLOAD IMAGE */
  app.post('/photos/upload', upload.array('photos', 10), (req, res) => {
    // const configDir = path.resolve(process.env.WEB_DIR_IMAGE)

    const files = req.files.map(file => {
      const dirPath = path.resolve(file.path).replace(/\\/g, "/")
      const dirRelativePath = `${dirPath.replace(new RegExp(config.WEB_DIR_IMAGE_RELATED), '')}`

      return { originalname: file.originalname, mimetype: file.mimetype, size: file.size, filename: file.filename, path: dirRelativePath }
    })

    res.send(files)
  })
  /* END UPLOAD IMAGE */

  /* BEGIN UPLOAD VIDEO */
  app.post('/videos/upload', uploadVideo.array('videos', 3), (req, res) => {
    // const configDir = path.resolve(process.env.WEB_DIR_VIDEO)
    const files = req.files.map(file => {
      const dirPath = path.resolve(file.path).replace(/\\/g, "/")
      const dirRelativePath = `${dirPath.replace(new RegExp(config.WEB_DIR_VIDEO_RELATED), '')}`

      return { originalname: file.originalname, mimetype: file.mimetype, size: file.size, filename: file.filename, path: dirRelativePath }
    })

    res.send(files)
  })
  /* END UPLOAD VIDEO */

  /* BEGIN CKEDITOR UPLOAD */
  var multipart = require('connect-multiparty');
  var multipartMiddleware = multipart();
  /* app.post('/uploader', upload.array('photos', 1), function (req, res, next) {
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
    var configDir = path.resolve(config.web.dir_images)
    var files = req.files.map(file => {
      var dirPath = path.resolve(file.path).replace(/\\/g, "/")
      var dirRelativePath = `${dirPath.replace(new RegExp(config.web.dir_images_relative), '')}`
      return {
        "uploaded": true,
        "url": dirRelativePath
      }
    })
    res.send(files[0])
  }) */

  app.post('/uploader', multipartMiddleware, (req, res) => {
    // eslint-disable-next-line global-require
    const fsNode = require('fs');

    console.log("uploader::", req.files);
    fsNode.readFile(req.files.upload.path, (err, data) => {
      const now = moment();
      const nameUser = `${req.auth.user}`.split('@')[0];
      const userDir = `${nameUser}/images/${now.year()}${now.month() + 1}${now.date()}`
      const dir = path.resolve(`${process.env.WEB_DIR_IMAGE}/${userDir}`)

      const ext = path.extname(req.files.upload.name)
      const name = path.basename(req.files.upload.name, ext).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      const newName = `${datetimeNowString()}_${name}${ext}`
      const fileDir = path.resolve(dir, newName)

      fs.ensureDir(dir).then(() => {
        fsNode.writeFile(fileDir, data, err => {
          if (err) console.log({ err });
          else {
            const url = `${process.env.IMAGE_SERVER}/userfiles/${userDir}/${newName}`

            res.send({
              webname: process.env.WEB_NAME,
              uploaded: true,
              url
            })
          }
        });
      }).catch(err => {
        console.error(err)
      })
    });
  });
  /* END CKEDITOR UPLOAD */

  /* BEGIN TEST IMAGE UPLOAD */
  app.post('/test/uploadImage/process', multipartMiddleware, (req, res) => {
    var fsNode = require('fs');
    const uuidv4 = require('uuid/v4');
    console.log("req::", req.files);
    fsNode.readFile(req.files.filepond.path, function (err, data) {
      var now = moment()
      const fileunique = uuidv4()
      const userDir = `tmp/${fileunique}`
      var dir = path.resolve(`${config.web.dir_images}/${userDir}`)

      /* var ext = path.extname(req.files.upload.name)
      var name = path.basename(req.files.upload.name, ext).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      var newName = `${now.year()}_${now.month() + 1}_${now.date()}_${now.hour()}_${now.minute()}_${now.second()}_${now.millisecond()}_${name}${ext}` */
      var newName = req.files.filepond.name
      var fileDir = path.resolve(dir, req.files.filepond.name)
      fs.ensureDir(dir).then(() => {
        fsNode.writeFile(fileDir, data, function (err) {
          if (err) console.log({ err: err });
          else {
            var url = `${config.web.image_server}/userfiles/${userDir}/${newName}`
            console.log("url: ", url)
            res.send(fileunique)
          }
        });
      }).catch(err => {
        console.error(err)
      })
    });
  });
  app.post('/test/uploadImage/restore', multipartMiddleware, (req, res) => {
    var fsNode = require('fs');
    console.log("req::", req.files);
    fsNode.readFile(req.files.filepond.path, function (err, data) {
      var now = moment()
      const userDir = `${req.headers.username}/images/${now.year()}${now.month() + 1}${now.date()}`
      var dir = path.resolve(`${config.web.dir_images}/${userDir}`)

      var ext = path.extname(req.files.filepond.name)
      var name = path.basename(req.files.filepond.name, ext).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      var newName = `${now.year()}_${now.month() + 1}_${now.date()}_${now.hour()}_${now.minute()}_${now.second()}_${now.millisecond()}_${name}${ext}`
      var fileDir = path.resolve(dir, newName)
      fs.ensureDir(dir).then(() => {
        fsNode.writeFile(fileDir, data, function (err) {
          if (err) console.log({ err: err });
          else {
            var url = `${config.web.image_server}/userfiles/${userDir}/${newName}`
            res.send({
              "uploaded": true,
              "url": url
            })
          }
        });
      }).catch(err => {
        console.error(err)
      })
    });
  });
  app.post('/test/uploadImage/revert', multipartMiddleware, (req, res) => {
    var fsNode = require('fs');
    console.log("req::", req.files);
    fsNode.readFile(req.files.filepond.path, function (err, data) {
      var now = moment()
      const userDir = `${req.headers.username}/images/${now.year()}${now.month() + 1}${now.date()}`
      var dir = path.resolve(`${config.web.dir_images}/${userDir}`)

      var ext = path.extname(req.files.filepond.name)
      var name = path.basename(req.files.filepond.name, ext).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      var newName = `${now.year()}_${now.month() + 1}_${now.date()}_${now.hour()}_${now.minute()}_${now.second()}_${now.millisecond()}_${name}${ext}`
      var fileDir = path.resolve(dir, newName)
      fs.ensureDir(dir).then(() => {
        fsNode.writeFile(fileDir, data, function (err) {
          if (err) console.log({ err: err });
          else {
            var url = `${config.web.image_server}/userfiles/${userDir}/${newName}`
            res.send({
              "uploaded": true,
              "url": url
            })
          }
        });
      }).catch(err => {
        console.error(err)
      })
    });
  });
  app.post('/test/uploadImage/fetch', multipartMiddleware, (req, res) => {
    var fsNode = require('fs');
    console.log("req fetch::", req.params);
    /* fsNode.readFile(req.files.filepond.path, function (err, data) {
      var now = moment()
      const userDir = `${req.headers.username}/images/${now.year()}${now.month() + 1}${now.date()}`
      var dir = path.resolve(`${config.web.dir_images}/${userDir}`)
  
      var ext = path.extname(req.files.filepond.name)
      var name = path.basename(req.files.filepond.name, ext).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      var newName = `${now.year()}_${now.month() + 1}_${now.date()}_${now.hour()}_${now.minute()}_${now.second()}_${now.millisecond()}_${name}${ext}`
      var fileDir = path.resolve(dir, newName)
      fs.ensureDir(dir).then(() => {
        fsNode.writeFile(fileDir, data, function (err) {
          if (err) console.log({ err: err });
          else {
            var url = `${config.web.image_server}/userfiles/${userDir}/${newName}`
            res.send({
              "uploaded": true,
              "url": url
            })
          }
        });
      }).catch(err => {
        console.error(err)
      })
    }); */
  });
  /* END TEST IMAGE UPLOAD */

  /* INFORMATION IMAGE */
  app.post('/information/images', (req, res) => {
    const fsFile = require("fs");
    const pathFile = req.body

    const fileName = `${process.env.WEB_DIR_IMAGE_RELATED}${pathFile}`
    const stats = fsFile.statSync(fileName)
    const fileSizeInBytes = stats.size

    return fileSizeInBytes
  })
  /* END INFORMATION IMAGE */
}