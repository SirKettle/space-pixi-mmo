const chalk = require('chalk');

module.exports = (port, isDevelopment = false) => {
  console.log(`
${chalk.red('-------------------------------------------------')}
${chalk.yellow('-------------------------------------------------')}
${chalk.green('-------------------------------------------------')}

 ${chalk.green('Pixi MMO Client')}
 ${chalk.white(`running on http://localhost:${port} - mode (${isDevelopment ? 'development' : 'prod'})`)}
 
${chalk.green('-------------------------------------------------')}
${chalk.yellow('-------------------------------------------------')}
${chalk.red('-------------------------------------------------')}
  `);
}
