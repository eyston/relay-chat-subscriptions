import React from 'react';
import Relay from 'react-relay';

import SendMessageMutation from '../../../mutations/SendMessageMutation';

const ENTER_KEY_CODE = 13;

class MessageComposer extends React.Component {

  state = {
    text: ''
  };

  componentDidMount() {
    this.refs.textarea.focus();
  }

  handleChange(event, value) {
    this.setState({text: event.target.value});
  }

  handleKeyDown(event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      event.preventDefault();
      var text = this.state.text.trim();
      if (text) {
        Relay.Store.commitUpdate(new SendMessageMutation({
          text,
          viewer: this.props.viewer,
          channel: this.props.channel
        }));
      }
      this.setState({text: ''});
    }
  }

  render() {
    return (
      <textarea
        ref='textarea'
        style={styles.composer}
        name='message'
        value={this.state.text}
        onChange={(e,v) => this.handleChange(e,v)}
        onKeyDown={(e) => this.handleKeyDown(e)}
      />
    );
  }

}

export default Relay.createContainer(MessageComposer, {
  fragments: {
    channel: () => Relay.QL`
      fragment on Channel {
        ${SendMessageMutation.getFragment('channel')}
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${SendMessageMutation.getFragment('viewer')}
      }
    `
  }
});

const styles = {
  composer: {
    boxSizing: 'border-box',
    fontSize: 14,
    width: '100%',
    height: '100%'
  }
}
