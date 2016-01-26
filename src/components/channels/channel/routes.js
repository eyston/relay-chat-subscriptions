import React from 'react';
import Relay from 'react-relay';
import { Route } from 'react-router';

import ChannelScreen from './ChannelScreen';
import JoinChannelMutation from '../../../mutations/JoinChannelMutation';


const ChannelQueries = {
  channel: () => Relay.QL`query { node(id: $channelId) }`,
  viewer: () => Relay.QL`query { viewer }`,
}

// couldn't get forceFetch to work with react-router... likely I don't
// understand what it should be doing~

class ChannelRoute extends Relay.Route {
  static routeName = 'ChannelRoute';
  static queries = ChannelQueries;
  static paramDefinitions = {
    channelId: {required: true}
  };
}

class ChannelWrapper extends React.Component {
  render() {
    const {params} = this.props;

    return (
      <Relay.RootContainer
        Component={ChannelScreen}
        route={new ChannelRoute({channelId: params.channelId})}
        forceFetch={true}
      />
    );
  }
}

// we want to ensure we join channels as we navigate to them
// this is done via an `onEnter` hook

const node = Relay.QL`
  query {
    node(id: $channelId) {
      ... on Channel {
        joined
        ${JoinChannelMutation.getFragment('channel')}
      }
    }
  }
`;

const onEnter = (nextState, replace, callback) => {
  const {params: {channelId}} = nextState;
  const query = Relay.createQuery(node, {channelId});
  Relay.Store.primeCache({query}, readyState => {
    if (readyState.done) {
      const [channel] = Relay.Store.readQuery(query);
      if (channel.joined) {
        callback();
      } else {
        Relay.Store.commitUpdate(new JoinChannelMutation({channel}), {
          onSuccess: () => callback()
        });
      }
    }
  });
}

export default (
  <Route
    path=':channelId'
    component={ChannelWrapper}
    onEnter={onEnter}
  />
);

// TODO: figure out why forceFetch doesn't do what I expect here
// export default (
//   <Route
//     path=':channelId'
//     component={ChannelScreen}
//     queries={ChannelQueries}
//     forceFetch={true}
//   />
// );
