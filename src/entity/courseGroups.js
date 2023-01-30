/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'courseGroups',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      courseGroupsName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'courseGroupsName'
      },
      courseGroupsCode: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'courseGroupsCode'
      },
      level: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 1,
        field: 'level'
      },
      descriptions: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'descriptions'
      },
      age: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'age'
      },
      countCourseLevels: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        field: 'countCourseLevels'
      },

      countUsers: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'countUsers'
      },
      image: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'image'
      },
      type: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        field: 'type'
      },
      money: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'money'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'userCreatorsId'
      },
      courseTypesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'courseTypesId'
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
      countCoursesStatus: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'countCoursesStatus'
      }
    },
    {
      tableName: 'courseGroups',
      timestamps: false
    }
  );
};
