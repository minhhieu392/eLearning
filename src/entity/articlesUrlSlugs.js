/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('articlesUrlSlugs', {
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
		articlesId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'articlesId'
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
			field: 'createDate'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'status'
		},
	}, {
		tableName: 'articles_urlSlugs',
		timestamps: false
	});
};
