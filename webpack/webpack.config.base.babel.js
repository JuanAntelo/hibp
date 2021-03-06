import path from 'path';

const projectRoot = path.join(__dirname, '..');

export default {
  cache: true,
  entry: [
    path.join(projectRoot, 'src', 'hibp.js'),
  ],
  output: {
    library: 'hibp',
    libraryTarget: 'umd',
    path: path.join(projectRoot, 'dist'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [
          `babel?${JSON.stringify({
            babelrc: false,
            plugins: [
              'add-module-exports',
            ],
            presets: [
              [
                'env',
                {
                  targets: {
                    browsers: [
                      '> 1%',
                      'last 2 versions',
                    ],
                  },
                },
              ],
            ],
          })}`,
        ],
        include: [
          path.join(projectRoot, 'src'),
        ],
      },
    ],
  },
  node: {
    fs: 'empty',
    module: 'empty',
  },
};
