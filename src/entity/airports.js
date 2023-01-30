/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'airports',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      airportName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'airportName'
      },

      provincesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'provincesId'
      },
      airportCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'airportCode'
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
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'images',
        defaultValue: []
      }
    },
    {
      tableName: 'airports',
      timestamps: false
    }
  );
};
