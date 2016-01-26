# Relay Chat Subscriptions

Work in progress example of using Relay subscriptions.  Currently this is using a fork of Relay and the subscription implementation is not finalized.  Track implementation in Relay issue https://github.com/facebook/relay/issues/541.

This repo will be updated with a correct implementation when subscriptions are finalized.

### End to End Flow

**1. Create Subscription class**

https://github.com/eyston/relay-chat-subscriptions/blob/master/src/components/channels/channel/SendMessageSubscription.js

```js
import Relay from 'react-relay';

import Message from './Message';

export default class SendMessageSubscription extends Relay.Subscription {

  static fragments = {
    channel: () => Relay.QL`fragment on Channel { id }`
  };

  getSubscription() {
    return Relay.QL`
      subscription {
        sendMessageSubscribe(input: $input) {
          edge {
            node {
              ${Message.getFragment('message')}
            }
          }
        }
      }
    `;
  }

  getVariables() {
    return {
      channelId: this.props.channel.id
    };
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'channel',
      parentID: this.props.channel.id,
      connectionName: 'messages',
      edgeName: 'edge',
      rangeBehaviors: {
        '': 'append'
      }
    }];
  }

}
```

**2.  Component instantiates Subscription / subscribes to Store**

https://github.com/eyston/relay-chat-subscriptions/blob/master/src/components/channels/channel/MessageList.js

```js
class MessageList extends React.Component {

  componentDidMount() {
    this.subscribe();
  }

  componentDidUpdate(prevProps) {
    this.subscribe(prevProps);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe(prevProps) {
    const {channel} = this.props;

    if (prevProps && prevProps.channel.id !== channel.id) {
      this.unsubscribe();
    }

    if (!this.subscription) {
      this.subscription = Relay.Store.subscribe(new SendMessageSubscription({channel}));
    }
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.dispose();
      this.subscription = null;
    }
  }

  render() {
    // ...
  }

}
```

**3.  Network Layer sends Subscription to server / listens for responses**

https://github.com/eyston/relay-chat-subscriptions/blob/master/src/network/SocketIONetworkLayer.js

```js
class SocketIONetworkLayer {

  constructor(socket) {
    this.socket = socket;

    this.subscriptionId = 0;
    this.subscriptions = {};
    this.socket.on('graphql/subscription/response', payload => this.handleSubscription(payload));    
  }

  sendSubscription(subscriptionRequest) {
    const id = this.subscriptionId++;
    this.subscriptions[id] = subscriptionRequest;
    this.socket.emit('graphql/subscription', {
      id,
      query: subscriptionRequest.getQueryString(),
      variables: subscriptionRequest.getVariables()
    });

    return () => {
      this.socket.emit('graphql/subscription/unsubscribe', {id});
      delete this.subscriptions[subscriptionRequest.id];
    }
  }

  handleSubscription(payload) {
    const request = this.subscriptions[payload.id];
    if (request) {
      if (payload.errors) {
        request.onError(payload.errors);
      } else if (!payload.data) {
        request.onError('Server response was missing `data`.');
      } else {
        request.onNext({response: payload.data});
      }
    }
  }

}
```

**4.  Server creates subscription, listens for events, executes graphql query on events**

https://github.com/eyston/relay-chat-subscriptions/blob/master/src/server/socket.js

```js
socket.on('graphql/subscription', async request => {
  // translates `subscription { sendMessageSubscribe({input:{channelId: 1}})}`
  // into `/channels/1/messages` which is the internal topic/channel for new messages
  const channel = await events.channelForSubscription(request);
  const listener = ev => handleSubscription(request, ev);

  subscriptions[request.id] = {
    channel,
    listener
  }

  events.subscribe(channel, listener);
});

socket.on('graphql/subscription/unsubscribe', ({id}) => {
  const {channel,listener} = subscriptions[id];
  events.unsubscribe(channel, listener);
  delete subscriptions[id];
});

const handleSubscription = (request, event) => {
  graphql(schema, request.query, {...rootValue, event }, request.variables).then(response => {
    socket.emit('graphql/subscription/response', {
      id: request.id,
      ...response
    });
  });
}
```
