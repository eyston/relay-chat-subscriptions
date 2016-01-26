import {
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql';

import {NodeField} from './node';
import {UserField,ViewerField} from './user';
import {
  ChannelField,
  JoinChannelMutation,
  JoinChannelSubscribe,
  LeaveChannelMutation,
  LeaveChannelSubscribe
} from './channel';
import {
  MessageField,
  SendMessageMutation,
  SendMessageSubscribe
} from './message';

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: NodeField,
    viewer: ViewerField,

    // convenience fields
    user: UserField,
    channel: ChannelField,
    message: MessageField
  })
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    sendMessage: SendMessageMutation,
    joinChannel: JoinChannelMutation,
    leaveChannel: LeaveChannelMutation
  })
});

const Subscription = new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    sendMessageSubscribe: SendMessageSubscribe,
    joinChannelSubscribe: JoinChannelSubscribe,
    leaveChannelSubscribe: LeaveChannelSubscribe
  })
});

export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
  subscription: Subscription
});
