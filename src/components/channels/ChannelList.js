import React from 'react';
import Relay from 'react-relay';

import Channel from './Channel';

class ChannelList extends React.Component {

  render() {
    const {viewer,activeChannelId} = this.props;
    const {channels} = viewer;

    return (
      <div style={styles.list}>
        <div style={styles.title}>Channels <span style={styles.number}>({channels.edges.length})</span></div>
        {channels.edges.map(edge => (
          <Channel
            key={edge.node.id}
            active={activeChannelId === edge.node.id}
            channel={edge.node}
          />
        ))}
      </div>
    );
  }

}

export default Relay.createContainer(ChannelList, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        channels(first: 50) {
          edges {
            node {
              id
              ${Channel.getFragment('channel')}
            }
          }
        }
      }
    `
  }
});

const styles = {
  list: {
    margin: 0,
    padding: 0
  },
  title: {
    fontSize: '16px',
    lineHeight: '30px',
    marginLeft: '14px',
    color: 'rgb(175,152,169)',
    fontWeight: 'bold'
  },
  number: {
    color: 'rgb(128,103,122)'
  }
}
