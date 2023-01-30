/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'villages',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      villageName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'villageName'
      },
      villageIdentificationCode: {
        type: DataTypes.STRING(200),
        // allowNull: false,
        field: 'villageIdentificationCode'
      },
      wardsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'wardsId'
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
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      }
    },
    {
      tableName: 'villages',
      timestamps: false
    }
  );
};
