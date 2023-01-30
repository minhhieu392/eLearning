/* eslint-disable camelcase */

import CONFIG from '../../config';
import ErrorHelpers from '../../helpers/errorHelpers';
import axios from 'axios';

export default {
  sendOtp: async param => {
    let finnalyResult;

    try {
      let { msisdn, message } = param;

      console.log('msisdn=', msisdn);
      console.log('message=', message);
      const url =
        CONFIG.URL_OTP +
        `sent?username=${CONFIG.USER_OTP}&password=${CONFIG.PASS_OTP}&source_addr=${CONFIG.BRANNAME_OTP}&dest_addr=${msisdn}&message=${message}`;
      const options = {
        method: 'get',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: encodeURI(url),
        data: ''
      };
      console.log('url=', url);
      finnalyResult = await axios(options);
      console.log('finnalyResult.data', finnalyResult);
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { result: finnalyResult.data, status: finnalyResult.data > 0 ? 1 : -1 };
  },
  getDeliveryOtp: async param => {
    let finnalyResult;

    try {
      let { msgid } = param;

      const url = CONFIG.URL_OTP + `getDelivery?username=${CONFIG.USER_OTP}&password=${CONFIG.PASS_OTP}&msgid=${msgid}`;
      console.log('url=', url);
      const options = {
        method: 'GET',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: encodeURI(url)
      };

      finnalyResult = await axios(options);
      console.log('finnalyResult', finnalyResult);
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { result: finnalyResult.data, status: 1 };
  }
};
