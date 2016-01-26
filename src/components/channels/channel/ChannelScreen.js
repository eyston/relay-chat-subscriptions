import React from 'react';
import Relay from 'react-relay';

import ChannelHeader from './ChannelHeader';
import MessageList from './MessageList';
import MemberList from './MemberList';
import MessageComposer from './MessageComposer';

class ChannelScreen extends React.Component {

  render() {
    const {channel,viewer} = this.props;
    return (
      <div style={styles.container}>
        <div style={styles.messages}>
          <ChannelHeader
            styles={styles.channelHeader}
            channel={channel}
            viewer={viewer}
          />
          <MessageList
            channel={channel}
            styles={styles.messagesList}
          />
          <div style={styles.messagesComposer}>
            <MessageComposer
              channel={channel}
              viewer={viewer}
            />
          </div>
        </div>
        <div style={styles.members}>
          <MemberList
            channel={channel}
            viewer={viewer}
          />
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(ChannelScreen, {
  fragments: {
    channel: () => Relay.QL`
      fragment on Channel {
        ${ChannelHeader.getFragment('channel')}
        ${MessageComposer.getFragment('channel')}
        ${MessageList.getFragment('channel')}
        ${MemberList.getFragment('channel')}
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${MessageComposer.getFragment('viewer')}
        ${MemberList.getFragment('viewer')}
        ${ChannelHeader.getFragment('viewer')}
      }
    `
  }
});


const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  messages: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 202,
  },
  channelHeader: {
    position: 'absolute',
    top: 0,
    height: 50,
    left: 0,
    right: 0
  },
  messagesList: {
    position: 'absolute',
    top: 50,
    bottom: 100,
    left: 0,
    right: 0
  },
  messagesComposer: {
    position: 'absolute',
    height: 100,
    bottom: 0,
    left: 0,
    right: 0
  },
  members: {
    overflowY: 'auto',
    position: 'absolute',
    borderLeft: '1px solid rgb(243,243,243)',
    top: 0,
    bottom: 0,
    right: 0,
    width: 200
  }
}
