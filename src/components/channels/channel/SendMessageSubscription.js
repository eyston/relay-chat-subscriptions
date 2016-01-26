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
