const GasPlugin = require('gas-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/main.ts',
    output: {
        filename: 'bundle.gs',
        path: `${__dirname}/dist`,
    },
    resolve: {
        extensions: ['.ts'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
        ],
    },
    plugins: [new GasPlugin()],
};