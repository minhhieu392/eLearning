/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'configs',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      config: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'config'
      }
    },
    {
      tableName: 'configs',
      timestamps: false
    }
  );
};
