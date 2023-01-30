import ErrorHelpers from '../helpers/errorHelpers';
import CONFIG from "../config";
const jwt = require("jsonwebtoken");

export default {
    createToken: async (param) => {
        let finnalyResult;

        console.log("param---",param)
        
        try {
            const newToken = jwt.sign(
                    param, CONFIG.JWT_SECRET,
                    {
                        expiresIn: `${CONFIG.TOKEN_LOGIN_EXPIRE}`
                        // algorithm: 'RS256'
                    }
                );

            finnalyResult = {token: newToken};
        } 
        catch (error) {
            // console.log("error: ", error)
            ErrorHelpers.errorThrow(error, 'getInfoError', 'UserServices');
        }
          
      return finnalyResult;
    },
    verifyToken: async (param) => {
        let finnalyResult;

        console.log("param---",param)
        
        try {
            const dataToken = jwt.verify(param,  CONFIG.JWT_SECRET)

            finnalyResult = {dataToken: dataToken};
        } 
        catch (error) {
            // console.log("error: ", error)
            ErrorHelpers.errorThrow(error, 'getInfoError', 'UserServices');
        }
          
      return finnalyResult;
    }
}