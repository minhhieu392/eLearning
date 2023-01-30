import models from '../../entity/index';
import ErrorHelpers from '../../helpers/errorHelpers';
import { md5 } from '../../utils/crypto';


const {
  sequelize /* Op,  users,
  places,
  medCustomers,
  clinicServicePackages,
  clinicReceiptDetail,
  clinicServices /* , medUnits
  clinicResults */
} = models;

export default {
  sp_users_trial_register: async param => {
    let finnalyResult;

    try {
      const { entity /*  sort, */ } = param;

      const { username, password, fullname, mobile, groupUserId, placesName, placesAddress, placesGroupPlacesId, medicalSpecialitiesList, dayExpire } = entity;

      let passMd5;

      console.log('trial by user filter : ', entity);

      if (password) {
        passMd5 = md5(password);
      }

      console.log("pass md5: ", passMd5);

      let result = await sequelize.query(
        'call sp_users_trial_register(:in_username, :in_password, :in_fullname, :in_mobile, :in_groupUserId, :in_places_name, :in_places_address, :in_placesGroupPlacesId, :in_medicalSpecialitiesList, :in_dayExpire, @out_output); SELECT @out_output;',
        {
          replacements: {
            in_username: username,
            in_password: passMd5,
            in_fullname: fullname,
            in_mobile: mobile,
            in_groupUserId: groupUserId,
            in_places_name: placesName,
            in_places_address: placesAddress,
            in_placesGroupPlacesId: placesGroupPlacesId,
            in_medicalSpecialitiesList: medicalSpecialitiesList,
            in_dayExpire: dayExpire
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('result: ', result);

      const rows = Object.keys(result[0]).map(e => result[0][e]);
      const output =  result[result.length - 1]['0']['@out_output'];

      result = result.map(e => e['0']);

      console.log("out: ", rows, output);
      
      finnalyResult = {
        rows,
        output
      };
      // console.log(finnalyResult);

      // if (finnalyResult[1]['0']['@out_output'] === '0') {
      //   throw (new ApiErrors.BaseError({
      //     statusCode: 202,
      //     type: 'crudError',
      //   }));
      // }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'ReportService');
    }

    return finnalyResult;
  }
};
