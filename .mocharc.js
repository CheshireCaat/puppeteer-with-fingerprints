module.exports = {
  require: ['dotenv/config'],
  inlineDiffs: true,
  timeout: '100s',
  exit: true,
};

process.env.NODE_ENV = 'test';
