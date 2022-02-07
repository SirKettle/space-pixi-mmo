module.exports = (port, isDevelopment = false) => (isDevelopment ? {
  // webSocketServer: '',
  // host: 'localhost',
  historyApiFallback: true,
  port
} : undefined);
