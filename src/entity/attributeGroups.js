/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'attributeGroups',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      attributeGroupsName: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'attributeGroupsName'
      },
      speciesGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'speciesGroupsId'
      },
      type: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'type'
      },
      order: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
        field: 'order'
      }
    },
    {
      tableName: 'attributeGroups',
      timestamps: false
    }
  );
};
