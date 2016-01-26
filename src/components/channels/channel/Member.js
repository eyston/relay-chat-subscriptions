import React from 'react';
import Relay from 'react-relay';

class Member extends React.Component {

  activeDot() {
    const {viewer,member} = this.props;

    if (viewer.id === member.id) {
      return <span style={styles.active}></span>;
    }
  }

  render() {
    const {viewer,member} = this.props;

    return (
      <div style={styles.member}>
        <span style={styles.name}>{this.props.member.name}</span>
        {this.activeDot()}
      </div>
    );
  }

}

export default Relay.createContainer(Member, {
  fragments: {
    member: () => Relay.QL`
      fragment on User {
        id
        name
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        id
      }
    `
  }
});

const styles = {
  member: {
    fontSize: '13px',
    lineHeight: '36px',
  },
  active: {
    display: 'inline-block',
    backgroundColor: 'rgb(0,187,125)',
    width: '10px',
    height: '10px',
    borderRadius: '5px',
    margin: '0 8px'
  },
  name: {
    color: 'rgb(85,83,89)',
    marginLeft: '14px'
  }
}
