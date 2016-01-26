import Relay from 'react-relay';

export default class JoinChannelMutation extends Relay.Mutation {

  static fragments = {
    channel: () => Relay.QL`fragment on Channel { id }`
  };

  getMutation() {
    return Relay.QL`mutation { joinChannel }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on JoinChannelPayload {
        edge
        channel {
          joined
        }
      }
    `;
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
    }, {
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        channel: this.props.channel.id
      }
    }];
  }

  getVariables() {
    return {
      channelId: this.props.channel.id
    }
  }

}
