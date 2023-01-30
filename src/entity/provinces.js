/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'provinces',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      provinceName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'provinceName'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      provinceIdentificationCode: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'provinceIdentificationCode'
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
      points: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'points'
      },
      centerPoint: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'centerPoint'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      }
    },
    {
      tableName: 'provinces',
      timestamps: false
    }
  );
};
