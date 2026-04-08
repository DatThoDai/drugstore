const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const traverseRules = (rules) => {
        if (!rules) return;
        rules.forEach((rule) => {
          if (rule.use && Array.isArray(rule.use)) {
            rule.use.forEach((use) => {
              if (
                use.loader &&
                use.loader.includes('css-loader') &&
                !use.loader.includes('postcss') &&
                use.options
              ) {
                use.options.esModule = false;
              }
            });
          }
          if (rule.oneOf) traverseRules(rule.oneOf);
          if (rule.rules) traverseRules(rule.rules);
        });
      };
      traverseRules(webpackConfig.module.rules);


      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'pdfjs-dist': path.join(__dirname, 'node_modules/pdfjs-dist/legacy/build/pdf.js'),
      };

      return webpackConfig;
    },
  },
};
