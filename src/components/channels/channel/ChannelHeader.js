import React from 'react';
import Relay from 'react-relay';

import { Link } from 'react-router';

import LeaveChannelMutation from '../../../mutations/LeaveChannelMutation';

class ChannelHeader extends React.Component {

  handleClick() {
    const {channel} = this.props;

    Relay.Store.commitUpdate(new LeaveChannelMutation({channel}));
  }

  leaveLink() {
    const {channel,viewer} = this.props;

    if (viewer.defaultChannel.id !== channel.id) {
      return <Link style={styles.button} to={`/channels/${viewer.defaultChannel.id}`} onClick={ev => this.handleClick(ev)}>leave</Link>;
    }
  }

  render() {
    const {channel,viewer} = this.props;

    return (
      <div style={{...styles.header, ...this.props.styles}}>
        <span style={styles.hash}>#</span>
        <span style={styles.name}>{channel.name}</span>
        {this.leaveLink()}
      </div>
    );
  }

}

export default Relay.createContainer(ChannelHeader, {
  fragments: {
    channel: () => Relay.QL`
      fragment on Channel {
        id
        name
        ${LeaveChannelMutation.getFragment('channel')}
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        defaultChannel {
          id
        }
      }
    `
  }
});

const styles = {
  header: {
    lineHeight: '50px',
    fontSize: 24,
    padding: '0 14px',
    borderBottom: '1px solid rgb(243,243,243)'
  },
  button: {
    float: 'right',
    display: 'inline-block',
    fontSize: '16px',
    lineHeight: '30px',
    padding: '0 10px',
    margin: '8px 0',
    textDecoration: 'none',
    color: 'rgb(85,83,89)',
    border: '2px solid rgb(85,83,89)',
    borderRadius: '5px'
  },
  hash: {
    color: 'rgb(158,157,166)'
  },
  name: {
    fontWeight: 'bold',
    color: 'rgb(85,83,89)'
  }
}
