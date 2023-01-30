import path from 'path';
import dotenv from 'dotenv';
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
} else {
  dotenv.config();
}

const config = { ...process.env };

// init type config
config.sql = {};
config.web = {};
config.sqlSms = {};
config.sql.pool = {};
config.rethinkdb = {};

// sql
config.sql.port = process.env.SQL_PORT;
config.sql.user = process.env.SQL_USER;
config.sql.password = process.env.SQL_PASSWORD;
config.sql.server = process.env.SQL_SERVER;
config.sql.database = process.env.SQL_DATABASE;
config.sqlSms.user = process.env.SQL_SMS_USER;
config.sqlSms.password = process.env.SQL_SMS_PASSWORD;
config.sqlSms.database = process.env.SQL_SMS_DATABASE;
config.sql.pool.max = 50;
config.sql.pool.min = 0;
config.sql.pool.idleTimeoutMillis = 1000000;
config.sql.connectionTimeout = 1000000;

// rethinkdb
config.rethinkdb.server = process.env.RETHINKDB_SERVER;
config.rethinkdb.port = process.env.RETHINKDB_PORT;
config.rethinkdb.db = process.env.RETHINKDB_DB;
// web
config.web.name = process.env.WEB_NAME;
config.web.port = process.env.WEB_PORT;
config.web.baseurl = process.env.WEB_BASE_URL;
config.web.dir_videos = process.env.WEB_DIR_VIDEO;
config.web.dir_videos_relative = process.env.WEB_DIR_VIDEO_RELATED;
config.web.dir_images = process.env.WEB_DIR_IMAGE;
config.web.dir_images_relative = process.env.WEB_DIR_IMAGE_RELATED;
config.filemanager = process.env.WEB_DIR_FILE_MANAGER;
config.web.image_server = process.env.IMAGE_SERVER;

config.PREFIX_API = process.env.PREFIX_API;
config.WEB_DIR_FILE_CONFIG_SERVER_OUT = process.env.WEB_DIR_FILE_CONFIG_SERVER_OUT;
config.WEB_DIR_FILE_CONFIG_SERVER_TEMPLATE = process.env.WEB_DIR_FILE_CONFIG_SERVER_TEMPLATE;
// BAO KIM
config.BAOKIM_CUSTOMER_EMAIL = process.env.BAOKIM_CUSTOMER_EMAIL;
config.BAOKIM_CUSTOMER_PHONE = process.env.BAOKIM_CUSTOMER_PHONE;
config.BAOKIM_CUSTOMER_NAME = process.env.BAOKIM_CUSTOMER_NAME;
config.BAOKIM_CUSTOMER_ADDRESS = process.env.BAOKIM_CUSTOMER_ADDRESS;
config.BAOKIM_WEBHOOKS = process.env.BAOKIM_WEBHOOKS;
config.BAOKIM_MERCHANT_ID = process.env.BAOKIM_MERCHANT_ID;
config.BAOKIM_SECRET = process.env.BAOKIM_SECRET;
config.BAOKIM_APIKEY = process.env.BAOKIM_APIKEY;
config.BAOKIM_URL = process.env.BAOKIM_URL;
config.BAOKIM_DATE_EXPIRED = process.env.BAOKIM_DATE_EXPIRED;
config.emailService = {
  gmail: {
    name: 'Gmail',
    port: 587,
    secure: false,
    user: config['MAIL_ACCOUNT'],
    pass: config['MAIL_PASSWORD']
  }
};
// set nodejs modules
export default config;
