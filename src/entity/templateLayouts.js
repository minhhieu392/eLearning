/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'templateLayouts',
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
      folder: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'folder'
      },
      usersCreatorId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'usersCreatorId'
      },
      createDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'createDate'
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'status'
      },
      typesId: {
        type: DataTypes.BIGINT,
        field: 'typesId'
      }
    },
    {
      tableName: 'template_layouts',
      timestamps: false
    }
  );
};
