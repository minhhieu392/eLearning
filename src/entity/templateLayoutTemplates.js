/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'templateLayoutTemplates',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      imagesResize: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [
          { desktop: { width: 0, height: 0 } },
          { tablet: { width: 0, height: 0 } },
          { mobile: { width: 0, height: 0 } }
        ],
        field: 'imagesResize'
      },
      templateLayoutsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'templateLayoutsId'
      },
      templatesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'templatesId'
      },
      imagePreview: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'imagePreview'
      }
    },
    {
      tableName: 'template_layout_templates',
      timestamps: false
    }
  );
};
