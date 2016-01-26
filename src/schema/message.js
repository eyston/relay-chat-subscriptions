import R from 'ramda';

import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLUnionType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId
} from 'graphql-relay';

import * as db from '../database';

import {NodeInterface} from './node';
import {UserType} from './user';
import {ChannelType} from './channel';
import {DateTimeType} from './datetime';

export const TextMessageType = new GraphQLObjectType({
  name: 'TextMessage',
  fields: () => ({
    id: globalIdField('Message'),
    text: {type: GraphQLString},
    sender: {type: UserType, resolve: db.resolve },
    time: {type: DateTimeType},
    channel: {type: ChannelType, resolve: db.resolve }
  }),
  isTypeOf: (obj) => obj instanceof db.Message && obj.type === 'text',
  interfaces: () => [NodeInterface]
});

export const EventMessageType = new GraphQLObjectType({
  name: 'EventMessage',
  fields: () => ({
    id: globalIdField('Message'),
    text: {type: GraphQLString},
    time: {type: DateTimeType},
    channel: {type: ChannelType, resolve: db.resolve }
  }),
  isTypeOf: (obj) => obj instanceof db.Message && obj.type === 'event',
  interfaces: () => [NodeInterface]
});

export const MessageType = new GraphQLUnionType({
  name: 'Message',
  types: [EventMessageType, TextMessageType]
});



const {
  connectionType: MessageConnection,
  edgeType: MessageEdge
} = connectionDefinitions({
  name: 'Message',
  nodeType: MessageType
});

export {
  MessageConnection,
  MessageEdge
};

export const MessageField = {
  type: MessageType,
  args: {
    id: {type: new GraphQLNonNull(GraphQLID)}
  },
  resolve: (_, {id}) => db.load('Message', id)
}

export const SendMessageMutation = mutationWithClientMutationId({
  name: 'SendMessage',
  inputFields: {
    text: { type: new GraphQLNonNull(GraphQLString) },
    channelId: { type: new GraphQLNonNull(GraphQLID) },
    senderId: { type: new GraphQLNonNull(GraphQLID) }
  },
  outputFields: () => ({
    edge: {
      type: MessageEdge,
      resolve: ({messageId}) => {
        const message = db.load('Message', messageId);
        const channel = db.load('Channel', message.channel);
        return {
          cursor: cursorForObjectInConnection(
            db.loadMany('Message', channel.messages),
            message
          ),
          node: message
        };
      }
    },
    channel: {
      type: ChannelType,
      resolve: ({channelId}) => db.load('Channel', channelId)
    }
  }),
  mutateAndGetPayload: ({text,senderId,channelId}) => {
    const message = db.sendMessage(
      text,
      fromGlobalId(senderId).id,
      fromGlobalId(channelId).id
    );

    return {messageId:message.id,channelId:message.channel};
  }
});

const SendMessageSubscribeInputType = new GraphQLInputObjectType({
  name: 'SendMessageSubscribeInput',
  fields: () => ({
    clientSubscriptionId: { type: new GraphQLNonNull(GraphQLString) },
    channelId: { type: new GraphQLNonNull(GraphQLID) }
  })
});

const SendMessageSubscribePayloadType = new GraphQLObjectType({
  name: 'SendMessageSubscribePayload',
  fields: () => ({
    clientSubscriptionId: {type: new GraphQLNonNull(GraphQLString)},
    edge: {
      type: MessageEdge,
      resolve: ({messageId}) => {
        const message = db.load('Message', messageId);
        const channel = db.load('Channel', message.channel);
        return {
          cursor: cursorForObjectInConnection(
            db.loadMany('Message', channel.messages),
            message
          ),
          node: message
        };
      }
    },
    channel: {
      type: ChannelType,
      resolve: ({channelId}) => db.load('Channel', channelId)
    }
  })
});

export const sendMessageChannel = channelId => `/channel/${channelId}/messages`;

export const SendMessageSubscribe = {
  type: SendMessageSubscribePayloadType,
  args: {
    input: { type: new GraphQLNonNull(SendMessageSubscribeInputType) }
  },
  resolve: ({event}, {input}, {rootValue}) => {
    const {clientSubscriptionId,channelId:globalChannelId} = input;
    const channelId = fromGlobalId(globalChannelId).id;

    if (event) {
      const {messageId} = event;
      return {messageId, channelId, clientSubscriptionId};
    } else {
      rootValue.channel = sendMessageChannel(channelId);
      return null;
    }
  }
}
