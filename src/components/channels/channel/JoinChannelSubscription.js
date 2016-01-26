import Relay from 'react-relay';

import Member from './Member';

export default class JoinChannelSubscription extends Relay.Subscription {

  static fragments = {
    channel: () => Relay.QL`fragment on Channel { id }`
  };

  getSubscription() {
    return Relay.QL`
      subscription {
        joinChannelSubscribe(input: $input) {
          edge {
            node {
              ${Member.getFragment('member')}
            }
          }
          channel {
            memberCount
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
      connectionName: 'members',
      edgeName: 'edge',
      rangeBehaviors: {
        '': 'append'
      }
    }];
  }

}
