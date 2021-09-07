const mongoose = require('mongoose');
const config = require('./index');
const log4js = require('../utils/log');

mongoose.connect(config.URL);

const db = mongoose.connection;

db.on('error', (err) => {
  log4js.error('数据库连接失败1');
});

db.on('open', () => {
  log4js.info('数据库连接成功');
});
