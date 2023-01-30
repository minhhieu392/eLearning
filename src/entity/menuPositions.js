/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('menuPositions', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'name'
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
		}
	}, {
		tableName: 'menu_positions',
		timestamps: false
	});
};
