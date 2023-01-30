/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'owners',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'name'
      },

      note: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'note'
      },
      villagesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'villagesId'
      },
      ethnic: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'ethnic'
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
      },
      points: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'points'
      }
    },
    {
      tableName: 'owners',
      timestamps: false
    }
  );
};
