import Relay from 'react-relay';

export default class SendMessageSubscription extends Relay.Subscription {

  static fragments = {
    channel: () => Relay.QL`fragment on Channel { id }`
  };

  getSubscription() {
    return Relay.QL`
      subscription {
        sendMessageSubscribe(input: $input) {
          channel {
            totalMessages
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
    return [];
  }

}
