import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';

import createHashHistory from 'history/lib/createHashHistory';
import { useRouterHistory, Route } from 'react-router';
import { RelayRouter } from 'react-router-relay';

import routes from './components/routes';

import SocketIONetworkLayer from './network/SocketIONetworkLayer';
import io from 'socket.io-client';

const socket = io();

Relay.injectNetworkLayer(new SocketIONetworkLayer(socket));

const history = useRouterHistory(createHashHistory)({ queryKey: false });

ReactDOM.render(
  <RelayRouter history={history} routes={routes} />,
  document.getElementById('root')
);
