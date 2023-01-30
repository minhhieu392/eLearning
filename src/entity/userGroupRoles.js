/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('userGroupRoles', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userGroupsId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'userGroupsId'
		},
		menusId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'menusId'
		},
		isViewed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			field: 'isViewed'
		},
		isUpdated: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			field: 'isUpdated'
		},
		isDeleted: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			field: 'isDeleted'
		},
		isBlocked: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			field: 'isBlocked'
		},
		isAdded: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			field: 'isAdded'
		},
		isApproved: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			field: 'isApproved'
		},
	}, {
		tableName: 'userGroupRoles',
		timestamps: false
	});
};
