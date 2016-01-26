import React from 'react';
import Relay from 'react-relay';

const TextMessage = props => {
  return (
    <div style={styles.message}>
      <div>
        <span style={styles.name}>{props.sender.name}</span>
        <span style={styles.time}>{props.time.format}</span>
      </div>
      <div style={styles.text}>{props.text}</div>
    </div>
  );
}

const EventMessage = props => {
  return (
    <div style={styles.message}>
      <span style={styles.event}>{props.text}</span>
    </div>
  );
}

class Message extends React.Component {

  render() {
    const {message} = this.props;
    const {__typename} = message;

    if (__typename === 'EventMessage') {
      return <EventMessage {...message} />;
    } else if (__typename === 'TextMessage') {
      return <TextMessage {...message} />;
    }
  }

}

export default Relay.createContainer(Message, {
  fragments: {
    message: () => Relay.QL`
      fragment on Message {
        __typename
        ... on TextMessage {
          text
          sender {
            name
          }
          time {
            format(string: "h:mm A")
          }
        }

        ... on EventMessage {
          text
        }
      }
    `
  }
});

const styles = {
  message: {
    padding: '12px 14px 12px'
  },
  name: {
    color: 'rgb(44,45,48)',
    display: 'inline-block',
    paddingRight: '0.5em',
    fontSize: '13px',
    fontWeight: 'bold',
    margin: 0
  },
  time: {
    color: 'rgb(162,161,169)',
    fontSize: '12px'
  },
  text: {
    color: 'rgb(44,45,48)',
    fontSize: '14px',
    paddingTop: 10
  },
  event: {
    color: 'rgb(162,161,169)',
    fontSize: '13px',
    fontStyle: 'italic'
  }
}
