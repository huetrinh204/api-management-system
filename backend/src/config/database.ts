import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Aiven provides a CA certificate for verified TLS connections. Leave unset for local MySQL.
const sslCA = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS as string,
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    ...(sslCA
      ? { dialectOptions: { ssl: { ca: sslCA, rejectUnauthorized: true } } }
      : {}),
    logging: false, // tắt SQL log để không lộ dữ liệu nhạy cảm
    define: {
      underscored: false,
      freezeTableName: true,
    },
  }
);

export default sequelize;
