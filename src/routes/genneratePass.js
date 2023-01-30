import { hash, createSalt, verifyPassword, verifyPasswordMd5, decryptedString, encryptedString, md5 } from '../utils/crypto'

export default (app) => {
  app.post('/genPassMd5', (req, res, next) => {
    const pass = req.body.password
    const passMd5 = md5(pass)

    res.send(passMd5)
  })

  app.get('/genPass', async (req, res, next) => {

    const salt = createSalt();

    console.log("salt ", salt)
    const saltBuffer = new Buffer("qcMqVYE0EzAU9Uz+mQxBaKFICG1vR1iq", 'base64')
    /* hash('AL7h8Jx4r8a8PjS5', saltBuffer).then(pass => {
      // console.log("pass: ", pass)
      // const hashes = crypto.getHashes();
      // console.log(hashes);
      verifyPassword('AL7h8Jx4r8a8PjS5', '1000:qcMqVYE0EzAU9Uz+mQxBaKFICG1vR1iq:RkdpgAcpijFqYgVxBCvJugMXqnt4j5f3').then(result => {
        res.send(
          pass
          + "\n1000:qcMqVYE0EzAU9Uz+mQxBaKFICG1vR1iq:RkdpgAcpijFqYgVxBCvJugMXqnt4j5f3"
          + "\n" + result
      )
      })
    })*/
    const passHash = await hash('AL7h8Jx4r8a8PjS5', saltBuffer)
    const passOk = await verifyPassword('AL7h8Jx4r8a8PjS5', '1000:qcMqVYE0EzAU9Uz+mQxBaKFICG1vR1iq:RkdpgAcpijFqYgVxBCvJugMXqnt4j5f3')

    res.send(
      passHash
      + "\n1000:qcMqVYE0EzAU9Uz+mQxBaKFICG1vR1iq:RkdpgAcpijFqYgVxBCvJugMXqnt4j5f3"
      + "\n" + passOk
    )
  })
}