/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'bankAccounts',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      bankAccountsName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'bankAccountsName'
      },
      bankAccountsNumber: {
        type: DataTypes.STRING(45),
        allowNull: false,
        field: 'bankAccountsNumber'
      },
      bankName: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'bankName'
      },
      QRcode: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'QRcode'
      },
      bankAccountTypesId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'bankAccountTypesId'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateUpdated'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      }
    },
    {
      tableName: 'bankAccounts',
      timestamps: false
    }
  );
};
