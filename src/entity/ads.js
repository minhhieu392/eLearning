/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('ads', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		title: {
			type: DataTypes.STRING(200),
			allowNull: false,
			field: 'title'
		},
		url: {
			type: DataTypes.STRING(500),
			allowNull: true,
			field: 'url'
		},
		contents: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'contents'
		},
		sitesId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'sitesId'
		},
		adsTypeId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'adsTypeId'
		},
		adsPositionsId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'adsPositionsId'
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
		descriptions: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'descriptions'
		},
		languagesId: {
			type: DataTypes.BIGINT,
		allowNull: false,
		field: 'languagesId'
		},
		orderBy: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0,
			field: 'orderBy'
		},
	}, {
		tableName: 'ads',
		timestamps: false
	});
};
