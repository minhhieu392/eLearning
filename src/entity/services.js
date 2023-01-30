/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'services',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      servicesName: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'servicesName'
      },
      servicesCode: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'servicesCode'
      },
      money: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: 'money'
      },

      promotionalMoney: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'promotionalMoney'
      },
      descriptions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'descriptions'
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
      tableName: 'services',
      timestamps: false
    }
  );
};
