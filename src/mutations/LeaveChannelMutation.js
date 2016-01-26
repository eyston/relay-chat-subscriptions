import Relay from 'react-relay';

export default class LeaveChannelMutation extends Relay.Mutation {

  static fragments = {
    channel: () => Relay.QL`fragment on Channel { id }`
  };

  getMutation() {
    return Relay.QL`mutation { leaveChannel }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on LeaveChannelPayload {
        channel {
          joined
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_DELETE',
      parentName: 'channel',
      parentID: this.props.channel.id,
      connectionName: 'members',
      pathToConnection: ['channel', 'members'],
      deletedIDFieldName: 'memberId'
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
