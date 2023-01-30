/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'username'
      },
      password: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'password'
      },
      fullname: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'fullname'
      },
      image: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'image'
      },

      email: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'email'
      },
      usersCode: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'usersCode'
      },
      mobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'mobile'
      },
      referralSocial: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'referralSocial',
        defaultValue: ''
      },
      userGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userGroupsId'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateUpdated'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      status: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        field: 'status'
      },
      idSocial: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'idSocial'
      }
    },
    {
      tableName: 'users',
      timestamps: false
    }
  );
};
