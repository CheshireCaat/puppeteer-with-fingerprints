module.exports = {
  require: ['dotenv/config'],
  inlineDiffs: true,
  timeout: 180_000,
  exit: true,
};

process.env.NODE_ENV = 'test';
