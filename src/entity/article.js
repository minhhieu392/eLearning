/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('article', {
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
		shortDescription: {
			type: DataTypes.STRING(500),
			allowNull: true,
			field: 'shortDescription'
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'description'
		},
		image: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'image',
			defaultValue: []
		},
		author: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'author'
		},
		source: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'source'
		},
		tag: {
			type: DataTypes.STRING(300),
			allowNull: true,
			field: 'tag'
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
		categoriesId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'categoriesId'
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
		urlSlugs:{
			type: DataTypes.STRING(500),
			allowNull: true,
			field: 'urlSlugs'
		},
	}, {
		tableName: 'article',
		timestamps: false
	});
};
