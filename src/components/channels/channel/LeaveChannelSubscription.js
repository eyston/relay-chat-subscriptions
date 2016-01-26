import Relay from 'react-relay';

export default class LeaveChannelSubscription extends Relay.Subscription {

  static fragments = {
    channel: () => Relay.QL`fragment on Channel { id }`
  };

  getSubscription() {
    return Relay.QL`
      subscription {
        leaveChannelSubscribe(input: $input) {
          memberId
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
      type: 'RANGE_DELETE',
      parentName: 'channel',
      parentID: this.props.channel.id,
      connectionName: 'members',
      pathToConnection: ['channel', 'members'],
      deletedIDFieldName: 'memberId'
    }];
  }

}
