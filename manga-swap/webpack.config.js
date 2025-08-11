const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Optimisations simples pour l'hébergement gratuit
  if (config.mode === 'production') {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxSize: 244000, // 244KB max par chunk pour hébergement gratuit
      },
    };
  }

  return config;
};