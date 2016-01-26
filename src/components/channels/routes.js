import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute } from 'react-router';

import RedirectToDefaultChannel from './RedirectToDefaultChannel';
import ChannelsScreen from './ChannelsScreen';
import ChannelRoutes from './channel/routes';

const ViewerQueries = {
  viewer: () => Relay.QL`query { viewer }`
};

export default ([
  <Route
    path='/'
    component={RedirectToDefaultChannel}
    queries={ViewerQueries}
  />,
  <Route
    path='channels'
    component={ChannelsScreen}
    queries={ViewerQueries}
  >
    <IndexRoute
      component={RedirectToDefaultChannel}
      queries={ViewerQueries}
    />
    {ChannelRoutes}
  </Route>
]);
