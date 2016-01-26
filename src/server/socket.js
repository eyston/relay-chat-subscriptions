import {graphql} from 'graphql';

import * as db from '../database';
import * as events from '../events';
import {schema} from '../schema';

let userCounter = 0;
let version = new Date().getTime().toString();


export const connect = socket => {

  const user = db.createUser({name: `Guest${userCounter++}`});
  db.loginUser(user.id);

  let subscriptions = {};
  const rootValue = {userId: user.id};

  socket.on('disconnect', () => {
    db.logoutUser(user.id);
    Object.values(subscriptions).forEach(({channel,listener}) =>
      events.unsubscribe(channel, listener)
    )
  });

  socket.on('graphql/queries', requests => {
    requests.forEach(request => {
      execute(schema, request.query, rootValue, request.variables).then(response => {
        socket.emit('graphql/query/response', {
          id: request.id,
          ...response
        });
      });
    });
  });

  socket.on('graphql/mutation', request => {
    execute(schema, request.query, rootValue, request.variables).then(response => {
      socket.emit('graphql/mutation/response', {
        id: request.id,
        ...response
      });
    });
  });

  socket.on('graphql/subscription', async request => {
    const channel = await events.channelForSubscription(request);
    const listener = ev => handleSubscription(request, ev);

    subscriptions[request.id] = {
      channel,
      listener
    }

    events.subscribe(channel, listener);
  });

  socket.on('graphql/subscription/unsubscribe', ({id}) => {
    const {channel,listener} = subscriptions[id];
    events.unsubscribe(channel, listener);
    delete subscriptions[id];
  });

  const handleSubscription = (request, event) => {
    execute(schema, request.query, {...rootValue, event }, request.variables).then(response => {
      socket.emit('graphql/subscription/response', {
        id: request.id,
        ...response
      });
    });
  }

}

const execute = (schema, query, rootValue, variables, operationName) => {
  return graphql(schema, query, rootValue, variables, operationName)
    .catch(error => ({errors: [error]}));
}
