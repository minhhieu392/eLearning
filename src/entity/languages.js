/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('languages', {
    id: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    languageName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'languageName'
    },
    languageCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'languageCode'
    },
    icon: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'icon'
    }
  }, {
    tableName: 'languages',
    timestamps: false
  });
};
