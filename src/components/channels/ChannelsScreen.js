import React from 'react';
import Relay from 'react-relay';

import ChannelList from './ChannelList';

class ChannelsScreen extends React.Component {

  render() {

    const {children,viewer,params} = this.props;

    return (
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <div style={styles.name}>{viewer.name}</div>
          <ChannelList
            viewer={viewer}
            activeChannelId={params.channelId}
          />
        </div>
        <div style={styles.body}>
          {children}
        </div>
      </div>
    );
  }

}

export default Relay.createContainer(ChannelsScreen, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        name
        ${ChannelList.getFragment('viewer')}
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
  sidebar: {
    overflowY: 'auto',
    position: 'absolute',
    backgroundColor: '#51354B',
    top: 0,
    left: 0,
    bottom: 0,
    width: 200
  },
  name: {
    color: '#fff',
    fontSize: '24px',
    lineHeight: '36px',
    marginLeft: '14px'
  },
  body: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 200,
    right: 0,
  }
}
