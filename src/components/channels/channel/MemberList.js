import R from 'ramda';

import React from 'react';
import Relay from 'react-relay';

import Member from './Member';
import JoinChannelSubscription from './JoinChannelSubscription';
import LeaveChannelSubscription from './LeaveChannelSubscription';

class MemberList extends React.Component {

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

    if (!this.subscriptions) {
      this.subscriptions = {
        join: Relay.Store.subscribe(new JoinChannelSubscription({channel})),
        leave: Relay.Store.subscribe(new LeaveChannelSubscription({channel}))
      };
    }
  }

  unsubscribe() {
    if (this.subscriptions) {
      Object.values(this.subscriptions).forEach(subscription => subscription.dispose());
      this.subscriptions = null;
    }
  }

  render() {
    const {viewer,channel} = this.props;
    const {members} = channel;

    return (
      <div style={styles.list}>
        <div style={styles.title}>Members <span style={styles.number}>({channel.memberCount})</span></div>
        {R.sortBy(R.path(['node', 'name']), members.edges).map(edge => (
          <Member key={edge.node.id} member={edge.node} viewer={viewer} />
        ))}
      </div>
    );
  }

}

export default Relay.createContainer(MemberList, {
  fragments: {
    channel: () => Relay.QL`
      fragment on Channel {
        memberCount
        ${JoinChannelSubscription.getFragment('channel')}
        ${LeaveChannelSubscription.getFragment('channel')}
        members(first: 50) {
          edges {
            node {
              id
              name
              ${Member.getFragment('member')}
            }
          }
        }
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${Member.getFragment('viewer')}
      }
    `
  }
});

const styles = {
  list: {
    margin: 0,
    padding: 0
  },
  number: {
    fontWeight: 'normal'
  },
  title: {
    fontSize: '16px',
    lineHeight: '30px',
    marginLeft: '14px',
    fontWeight: 'bold',
    color: 'rgb(85,83,89)'
  }
}
