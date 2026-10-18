require('dotenv').config();

// Aiven provides a CA certificate for verified TLS connections. Leave unset for local MySQL.
const sslCA = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'api_doc_management',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    ...(sslCA
      ? { dialectOptions: { ssl: { ca: sslCA, rejectUnauthorized: true } } }
      : {}),
    logging: false,
  },
};
