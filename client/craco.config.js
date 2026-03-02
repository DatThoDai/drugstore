const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix 1: css-loader + webpack5 generates __webpack_exports__.d.e.f.a.u.l.t
      // which crashes during production build (HookWebpackError).
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

      // Fix 2: pdfjs-dist v3 ships ESM by default which causes runtime crash.
      // Alias to legacy CommonJS build.
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'pdfjs-dist': path.join(__dirname, 'node_modules/pdfjs-dist/legacy/build/pdf.js'),
      };

      return webpackConfig;
    },
  },
};
