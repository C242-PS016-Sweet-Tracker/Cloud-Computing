import mysql from 'mysql2/promise';
// import { Connector } from '@google-cloud/cloud-sql-connector';

const createPool = async () => {
//   const connector = new Connector();
  const clientOpts = {
    host:'34.50.64.242',
    user: 'sweet-tracker',
    password: 'pelacakmanis216',
    database: 'main',
  };

  return mysql.createPool(clientOpts);
};

// Buat pool global untuk digunakan di seluruh aplikasi
let pool;

const initPool = async () => {
  if (!pool) {
    pool = await createPool();
    console.log('Database pool created');
  }
  return pool;
};

export default initPool;