import R from 'ramda';

import {
  connectionFromArray
} from 'graphql-relay';

import * as events from '../events';

export class User { }
export class Channel { }
export class Message { }

const typeMap = {
  User: User,
  Channel: Channel,
  Message: Message
}

let id = 0;

let store = {}

export const resolve = (obj, args, ctx) => {
  const {fieldName,returnType} = ctx;
  const type = returnType.name;

  return load(type, obj[fieldName]);
}

export const resolveConnection = (transform) => {
  return (obj, args, ctx) => {
    const {fieldName,returnType} = ctx;
    const ids = obj[fieldName] || [];

    // alternatively could just parse the connection name lulz
    const edge = returnType.getFields().edges;
    const node = edge.type.ofType.getFields().node;
    const type = node.type.name;

    const items = loadMany(type, ids);

    return connectionFromArray(transform(items, args), args);
  }
}

export const load = (type, id) => {
  return store[type][id];
}

export const loadMany = (type, ids = []) => {
  return ids.map(id => load(type, id));
}

export const loadAll = type => {
  return Object.values(store[type]);
}

export const create = (type, data) => {
  const item = Object.assign(new typeMap[type], {id: ++id}, data);
  return save(type, item);
}

export const save = (type, item) => {
  store = R.assocPath([type, item.id], Object.assign(new typeMap[type], item), store);
  return item;
}

export const index = (type, id, field, child) => {
  let item = load(type, id);
  item = R.assoc(field, R.append(child.id, item[field]), item);
  return save(type, item);
}

export const add = (type, id, field, childId) => {
  let item = load(type, id);
  item = R.assoc(field, R.append(childId, item[field]), item);
  return save(type, item);
}

export const remove = (type, id, field, childId) => {
  let item = load(type, id);
  item = R.assoc(field, R.without([childId], item[field]), item);
  return save(type, item);
}

export const createUser = data => {
  const user = create('User', {
    defaultChannel: general.id,
    ...data
  });

  events.publish('/user/create', {
    type: 'USER_CREATE',
    userId: user.id
  });

  return user;
}

export const loginUser = userId => {
  const user = load('User', userId);

  events.publish(`/user/${userId}/login`, {
    type: 'USER_LOGIN',
    userId: user.id
  });

  joinChannel(user.id, user.defaultChannel);
}

export const logoutUser = userId => {
  const user = load('User', userId);
  user.channels.forEach(channelId => leaveChannel(userId, channelId));

  events.publish(`/user/${userId}/logout`, {
    type: 'USER_LOGOUT',
    userId: user.id
  });
}

export const joinChannel = (userId, channelId) => {
  add('User', userId, 'channels', channelId);
  add('Channel', channelId, 'members', userId);

  events.publish(`/channel/${channelId}/members/join`, {
    type: 'JOIN_CHANNEL',
    channelId,
    userId
  });

  const user = load('User', userId);
  const message = create('Message', {
    type: 'event',
    text: `${user.name} joined channel.`,
    time: new Date(),
    channel: channelId
  });

  add('Channel', message.channel, 'messages', message.id);

  events.publish(`/channel/${channelId}/messages`, {
    type: 'SEND_MESSAGE',
    messageId: message.id,
    channelId,
    text: message.text
  });
}

export const leaveChannel = (userId, channelId) => {
  remove('User', userId, 'channels', channelId);
  remove('Channel', channelId, 'members', userId);

  events.publish(`/channel/${channelId}/members/leave`, {
    type: 'LEAVE_CHANNEL',
    channelId,
    userId
  });

  const user = load('User', userId);
  const message = create('Message', {
    type: 'event',
    text: `${user.name} left channel.`,
    time: new Date(),
    channel: channelId
  });

  add('Channel', message.channel, 'messages', message.id);

  events.publish(`/channel/${channelId}/messages`, {
    type: 'SEND_MESSAGE',
    messageId: message.id,
    channelId,
    text: message.text
  });
}

export const sendMessage = (text, senderId, channelId) => {
  const message = create('Message', {
    type: 'text',
    text,
    time: new Date(),
    sender: senderId,
    channel: channelId
  });

  add('Channel', message.channel, 'messages', message.id);

  events.publish(`/channel/${channelId}/messages`, {
    type: 'SEND_MESSAGE',
    messageId: message.id,
    channelId,
    senderId,
    text
  });

  return message;
}

export const general = create('Channel', {
  name: 'general'
});

create('Channel', {
  name: 'random'
});

create('Channel', {
  name: 'need help'
});

create('Channel', {
  name: 'graphql'
});

create('Channel', {
  name: 'relay'
});
