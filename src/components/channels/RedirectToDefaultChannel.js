import React from 'react';
import Relay from 'react-relay';


class RedirectToDefaultChannel extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  componentWillMount() {
    const {router} = this.context;
    const {viewer} = this.props;

    router.replace(`/channels/${viewer.defaultChannel.id}`);
  }

  render() {
    return <div></div>;
  }
}

export default Relay.createContainer(RedirectToDefaultChannel, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        defaultChannel {
          id
        }
      }
    `
  }
});
