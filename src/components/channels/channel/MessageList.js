import React from 'react';
import Relay from 'react-relay';

import Message from './Message';
import SendMessageSubscription from './SendMessageSubscription';

class MessageList extends React.Component {

  componentDidMount() {
    this.scrollToBottom();
    this.subscribe();
  }

  componentWillUpdate() {
    const container = this.refs.container;
    this.shouldScrollToBottom = container.scrollTop + container.offsetHeight === container.scrollHeight;
  }

  componentDidUpdate(prevProps) {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }

    this.subscribe(prevProps);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  scrollToBottom() {
    const container = this.refs.container;
    container.scrollTop = container.scrollHeight;
  }

  subscribe(prevProps) {
    const {channel} = this.props;

    if (prevProps && prevProps.channel.id !== channel.id) {
      this.unsubscribe();
    }

    if (!this.subscription) {
      this.subscription = Relay.Store.subscribe(new SendMessageSubscription({channel}));
    }
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.dispose();
      this.subscription = null;
    }
  }

  render() {
    const {messages} = this.props.channel;

    return (
      <div style={{...styles.container, ...this.props.styles}} ref='container'>
        <div style={styles.list}>
          {messages.edges.map(edge => (
            <Message key={edge.node.id} message={edge.node} />
          ))}
        </div>
      </div>
    );
  }

}

export default Relay.createContainer(MessageList, {
  fragments: {
    channel: () => Relay.QL`
      fragment on Channel {
        id
        ${SendMessageSubscription.getFragment('channel')}
        messages(last: 50) {
          edges {
            node {
              ${Message.getFragment('message')}
            }
          }
        }
      }
    `
  }
});

const styles = {
  container: {
    overflowY: 'auto'
  },
  list: {
    fontSize: '16px',
    margin: 0,
    padding: 0
  }
}
