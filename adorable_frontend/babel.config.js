module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@utils': './src/utils',
            '@services': './src/services',
            '@config': './src/config',
            '@types': './src/types',
            '@hooks': './src/hooks',
            '@contexts': './src/contexts'
          }
        }
      ]
    ]
  };
};
