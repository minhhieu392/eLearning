/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('userGroups', {
		id: {
			type: DataTypes.BIGINT(20),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userGroupName: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'userGroupName'
		},
		userGroupDescriptions: {
			type: DataTypes.STRING(500),
			allowNull: true,
			field: 'userGroupDescriptions'
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
		status: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'status'
		}
	}, {
		tableName: 'userGroups',
		timestamps: false
	});
};
