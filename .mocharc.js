'use strict';

module.exports = {
  require: ['dotenv/config'],
  inlineDiffs: true,
  timeout: '300s',
  exit: true,
};

process.env.NODE_ENV = 'test';
