/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('categoriesUrlSlugs', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		urlSlug: {
			type: DataTypes.STRING(500),
			allowNull: false,
			field: 'urlSlug'
		},
		sitesId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'sitesId'
		},
		categoriesId: {
            type: DataTypes.BIGINT,
			allowNull: false,
			field: 'categoriesId'
		},
		createDate: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'create_date'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'status'
		},
	}, {
		tableName: 'categories_urlSlugs',
		timestamps: false
	});
};
