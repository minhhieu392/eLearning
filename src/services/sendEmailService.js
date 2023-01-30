import nodemailer from 'nodemailer';
import smtpTransport  from 'nodemailer-smtp-transport';
import ErrorHelpers from '../helpers/errorHelpers';
import CONFIG from '../config';
export default {
    sendGmail: async param => {
        let finnalyResult;

        console.log("param---",param)
        const {emailTo,subject,sendTypeMail,body} = param
        
        try {
            const transporter = await nodemailer.createTransport({
                host: CONFIG['MAIL_HOST'],
                port: CONFIG['MAIL_PORT'],
                secure: true,
                auth: {
                    user: CONFIG['MAIL_ACCOUNT'],
                    pass: CONFIG['MAIL_PASSWORD']
                },
            });

            if(sendTypeMail==='text')
            {
                await transporter.sendMail({
                    from: CONFIG['MAIL_ACCOUNT'],
                    to: emailTo,
                    subject: subject,
                    text: body
                },
                (error, info) => {
                    if (error) {
                        console.log("email error",error);
                        finnalyResult = {success:false}
                    }
                    else{
                        console.log('Message %s sent: %s', info.messageId, info.response);
                        finnalyResult = {success:true}
                    }
                }
                );
    
            }
            else
            {
                console.log("email CONFIG['MAIL_ACCOUNT']",CONFIG['MAIL_ACCOUNT']);
                console.log("email emailTo",emailTo);
                console.log("subject",subject);
                console.log("body",body);
                await transporter.sendMail(
                    {
                    from: CONFIG['MAIL_ACCOUNT'],
                    to: emailTo,
                    subject: subject,
                    html: body
                    },
                    (error, info) => {
                        if (error) {
                            console.log("email error",error);
                            finnalyResult = {success:false}
                        }
                        else{
                            console.log('Message %s sent: %s', info.messageId, info.response);
                            finnalyResult = {success:true}
                        }
                    }
                );
    
            }
            
        } 
        catch (error) {
            // console.log("error: ", error)
            ErrorHelpers.errorThrow(error, 'getInfoError', 'UserServices');
        }
          console.log("send email finnalyResult",finnalyResult)
      
        return finnalyResult;
    }
}