import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

export default merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img' },
        { from: 'css', to: 'css' },
        // Copy JS components and utils separately to avoid conflict with webpack entry
        { from: 'js/components', to: 'js/components' },
        { from: 'js/utils', to: 'js/utils' },
        { from: 'js/vendor', to: 'js/vendor', noErrorOnMissing: true },
        { from: 'icon.svg', to: 'icon.svg', noErrorOnMissing: true },
        { from: 'favicon.ico', to: 'favicon.ico', noErrorOnMissing: true },
        { from: 'robots.txt', to: 'robots.txt', noErrorOnMissing: true },
        { from: 'icon.png', to: 'icon.png', noErrorOnMissing: true },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest', noErrorOnMissing: true },
      ],
    }),
  ],
});