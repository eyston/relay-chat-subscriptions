import React from 'react';
import Relay from 'react-relay';

import { Link } from 'react-router';

import SendMessageSubscription from './SendMessageSubscription';

class Channel extends React.Component {

  state = {
    readMessages: 0
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentWillMount() {
    this.setState({
      readMessages: this.props.channel.totalMessages
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.active) {
      this.setState({
        readMessages: nextProps.channel.totalMessages
      });
    }
  }

  componentDidMount() {
    this.subscribe();
  }

  componentDidUpdate(prevProps) {
    this.subscribe(prevProps);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe(prevProps) {
    const {channel} = this.props;

    if (prevProps && prevProps.channel.id !== channel.id) {
      this.unsubscribe();
    }

    if (!channel.joined) {
      this.unsubscribe();
    }

    if (channel.joined && !this.subscription) {
      this.subscription = Relay.Store.subscribe(
        new SendMessageSubscription({channel})
      );
    }
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.dispose();
      this.subscription = null;
    }
  }

  unreadMessages() {
    const count = this.props.channel.totalMessages - this.state.readMessages;
    if (count > 0) {
      return <div style={styles.unread}>{count}</div>;
    } else {
      return null;
    }
  }

  render() {
    const {active, channel} = this.props;

    let style = styles.channel;

    if (this.props.active) {
      style = {...style, ...styles.active};
    } else if (channel.joined) {
      style = {...style, ...styles.joined};
    }

    return (
      <Link style={style} to={`/channels/${channel.id}`}>
        <span style={styles.hash}># </span>
        <span style={styles.name}>{channel.name}</span>
        {this.unreadMessages()}
      </Link>
    );
  }
}

export default Relay.createContainer(Channel, {
  fragments: {
    channel: () => Relay.QL`
      fragment on Channel {
        id
        name
        joined
        totalMessages
        ${SendMessageSubscription.getFragment('channel')}
      }
    `
  }
});

const styles = {
  channel: {
    display: 'block',
    textDecoration: 'none',
    margin: '2px 0',
    marginRight: '14px',
    paddingLeft: '14px',
    fontSize: '16px',
    lineHeight: '24px',
    borderTopRightRadius: '5px',
    borderBottomRightRadius: '5px',
    color: 'rgb(128,103,122)'
  },
  hash: {
  },
  name: {
    lineHeight: '20px',
    fontSize: '16px'
  },
  joined: {
    color: 'rgb(175,152,169)'
  },
  active: {
    color: 'rgb(238,247,245)',
    backgroundColor: 'rgb(43,155,139)'
  },
  unread: {
    display: 'inline-block',
    marginLeft: '8px',
    width: '18px',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'rgb(253,26,81)',
    fontSize: '12px',
    lineHeight: '18px',
    borderRadius: '9px'
  }
}
