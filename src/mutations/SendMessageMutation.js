import Relay from 'react-relay';

export default class SendMessageMutation extends Relay.Mutation {

  static fragments = {
    viewer: () => Relay.QL`fragment on User { id }`,
    channel: () => Relay.QL`fragment on Channel { id }`
  };

  getMutation() {
    return Relay.QL`mutation { sendMessage }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on SendMessagePayload {
        edge
        channel {
          messages
        }
      }
    `;
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

  getVariables() {
    return {
      text: this.props.text,
      senderId: this.props.viewer.id,
      channelId: this.props.channel.id
    }
  }

}
