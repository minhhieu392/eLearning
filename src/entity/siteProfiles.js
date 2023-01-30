/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('siteProfiles', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		address: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'address'
		},
		hotline: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'hotline'
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'email'
		},
		socialChannelFacebookId: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'socialChannelFacebookId'
		},
		socialChannelZaloId: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'socialChannelZaloId'
		},
		chatbox: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'chatbox'
		},
		sitesId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'sitesId'
		},

		employee: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'employee'
		},
		addressHere: {
			type: DataTypes.JSON,
			allowNull: true,
			field: 'addressHere'
		},
    languagesId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'languagesId'
    }
	}, {
		tableName: 'site_profiles',
		timestamps: false
	});
};
