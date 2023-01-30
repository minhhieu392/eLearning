/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'districts',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      districtName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'districtName'
      },
      districtIdentificationCode: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'districtIdentificationCode'
      },
      provincesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'provincesId'
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
      points: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'points',
        defaultValue: {}
      },
      centerPoint: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'centerPoint'
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'status'
      },
      polygonCafe: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        field: 'polygonCafe'
      }
    },
    {
      tableName: 'districts',
      timestamps: false
    }
  );
};
