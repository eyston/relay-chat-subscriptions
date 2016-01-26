import http from 'http';
import express from 'express';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import webpack from 'webpack';
import compression from 'compression';
import webpackMiddleware from 'webpack-dev-middleware';
import IO from 'socket.io';

import {schema} from './src/schema';
import {connect} from './src/server/socket';
import * as bots from './src/server/bots';

const APP_PORT = 3000;

const compiler = webpack({
  entry: path.resolve(__dirname, 'src', 'app.js'),
  output: {filename: 'app.js', path: '/'},
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel'
    }]
  }
});

const app = express();
const server = http.Server(app);
const io = IO(server);

io.on('connect', connect);

bots.start();

app.use(compression());
app.use(express.static(path.resolve(__dirname, 'public')));

app.use('/graphql', graphQLHTTP({schema, rootValue: {}, pretty:true, graphiql:true}));
app.use(webpackMiddleware(compiler, {
  contentBase: '/public/',
  publicPath: '/js/',
  stats: {colors: true, chunks: false}
}));

server.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`);
});
