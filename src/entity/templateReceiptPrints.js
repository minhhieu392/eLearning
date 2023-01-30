/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'templateReceiptPrints',
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
      images: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'images'
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
      paperSizesId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'paperSizesId'
      }
    },
    {
      tableName: 'template_receipt_prints',
      timestamps: false
    }
  );
};
