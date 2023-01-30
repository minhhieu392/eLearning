/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('sites', {
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
		url: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'url'
		},
		seoKeywords: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'seoKeywords'
		},
		seoDescriptions: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'seoDescriptions'
		},
		templatesId: {
			type: DataTypes.BIGINT,
			allowNull: true,
			field: 'templatesId'
		},
		groupSitesId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'groupSitesId'
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
		logo: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'logo'
		},
		icon: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'icon'
		},
	}, {
		tableName: 'sites',
		timestamps: false
	});
};
