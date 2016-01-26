import R from 'ramda';

import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  toGlobalId
} from 'graphql-relay';

import * as db from '../database';

import {NodeInterface} from './node';
import {UserConnection,UserEdge,UserType} from './user';
import {MessageConnection} from './message';

export const ChannelType = new GraphQLObjectType({
  name: 'Channel',
  fields: () => ({
    id: globalIdField('Channel'),
    name: {type: GraphQLString},
    joined: {
      type: GraphQLBoolean,
      resolve: ({members}, _, {rootValue:{userId}}) => (members || []).includes(userId)
    },
    memberCount: {
      type: GraphQLInt,
      resolve: ({members}) => (members || []).length
    },
    members: {
      type: UserConnection,
      args: connectionArgs,
      resolve: db.resolveConnection(R.sortBy(R.prop('name')))
    },
    totalMessages: {
      type: GraphQLInt,
      resolve: ({messages}) => (
        db.loadMany('Message', messages)
          .filter(m => m.type === 'text')
          .length
      )
    },
    messages: {
      type: MessageConnection,
      args: connectionArgs,
      resolve: db.resolveConnection(R.sortBy(R.prop('time')))
    }
  }),
  isTypeOf: (obj) => obj instanceof db.Channel,
  interfaces: () => [NodeInterface]
});

const {
  connectionType: ChannelConnection,
  edgeType: ChannelEdge
} = connectionDefinitions({
  name: 'Channel',
  nodeType: ChannelType
});

export {
  ChannelConnection,
  ChannelEdge
};

export const ChannelField = {
  type: ChannelType,
  args: {
    id: {type: new GraphQLNonNull(GraphQLID)}
  },
  resolve: (_, {id}) => db.load('Channel', id)
}

export const JoinChannelMutation = mutationWithClientMutationId({
  name: 'JoinChannel',
  inputFields: {
    channelId: { type: new GraphQLNonNull(GraphQLID) }
  },
  outputFields: () => ({
    channel: {
      type: ChannelType,
      resolve: ({channelId}) => db.load('Channel', channelId)
    },
    edge: {
      type: UserEdge,
      resolve: ({channelId,userId}) => {
        const user = db.load('User', userId);
        const channel = db.load('Channel', channelId);
        return {
          cursor: cursorForObjectInConnection(
            db.loadMany('User', channel.members),
            user
          ),
          node: user
        };
      }
    }
  }),
  mutateAndGetPayload: ({channelId:globalChannelId}, {rootValue:{userId}}) => {
    const channelId = fromGlobalId(globalChannelId).id;
    db.joinChannel(userId, channelId);

    return {userId,channelId};
  }
});

export const LeaveChannelMutation = mutationWithClientMutationId({
  name: 'LeaveChannel',
  inputFields: {
    channelId: { type: new GraphQLNonNull(GraphQLID) }
  },
  outputFields: () => ({
    channel: {
      type: ChannelType,
      resolve: ({channelId}) => db.load('Channel', channelId)
    },
    memberId: {type: new GraphQLNonNull(GraphQLID), resolve: ({userId}) => toGlobalId('User', userId) }
  }),
  mutateAndGetPayload: ({channelId:globalChannelId}, {rootValue:{userId}}) => {
    const channelId = fromGlobalId(globalChannelId).id;
    db.leaveChannel(userId, channelId);

    return {userId,channelId};
  }
});

const JoinChannelSubscribeInputType = new GraphQLInputObjectType({
  name: 'JoinChannelSubscribeInput',
  fields: () => ({
    clientSubscriptionId: { type: new GraphQLNonNull(GraphQLString) },
    channelId: { type: new GraphQLNonNull(GraphQLID) }
  })
});

const JoinChannelSubscribePayloadType = new GraphQLObjectType({
  name: 'JoinChannelSubscribePayload',
  fields: () => ({
    clientSubscriptionId: {type: new GraphQLNonNull(GraphQLString)},
    channel: {
      type: ChannelType,
      resolve: ({channelId}) => db.load('Channel', channelId)
    },
    member: {
      type: UserType,
      resolve: ({userId}) => db.load('User', userId)
    },
    edge: {
      type: UserEdge,
      resolve: ({channelId,userId}) => {
        const user = db.load('User', userId);
        const channel = db.load('Channel', channelId);
        return {
          cursor: cursorForObjectInConnection(
            db.loadMany('User', channel.members),
            user
          ),
          node: user
        };
      }
    }
  })
});

export const joinChannelChannel = channelId => `/channel/${channelId}/members/join`;

export const JoinChannelSubscribe = {
  type: JoinChannelSubscribePayloadType,
  args: {
    input: { type: new GraphQLNonNull(JoinChannelSubscribeInputType) }
  },
  resolve: ({event}, {input}, {rootValue}) => {
    const {clientSubscriptionId,channelId:globalChannelId} = input;

    if (event) {
      const {userId,channelId} = event;
      return {userId,channelId,clientSubscriptionId};
    } else {
      rootValue.channel = joinChannelChannel(fromGlobalId(globalChannelId).id);
      return null;
    }
  }
}

const LeaveChannelSubscribeInputType = new GraphQLInputObjectType({
  name: 'LeaveChannelSubscribeInput',
  fields: () => ({
    clientSubscriptionId: { type: new GraphQLNonNull(GraphQLString) },
    channelId: { type: new GraphQLNonNull(GraphQLID) }
  })
});

const LeaveChannelSubscribePayloadType = new GraphQLObjectType({
  name: 'LeaveChannelSubscribePayload',
  fields: () => ({
    clientSubscriptionId: {type: new GraphQLNonNull(GraphQLString)},
    channel: {
      type: ChannelType,
      resolve: ({channelId}) => db.load('Channel', channelId)
    },
    member: {
      type: UserType,
      resolve: ({userId}) => db.load('User', userId)
    },
    memberId: {type: new GraphQLNonNull(GraphQLID), resolve: ({userId}) => toGlobalId('User', userId) }
  })
});

export const leaveChannelChannel = channelId => `/channel/${channelId}/members/leave`;

export const LeaveChannelSubscribe = {
  type: LeaveChannelSubscribePayloadType,
  args: {
    input: { type: new GraphQLNonNull(LeaveChannelSubscribeInputType) }
  },
  resolve: ({event}, {input}, {rootValue}) => {
    const {clientSubscriptionId,channelId:globalChannelId} = input;

    if (event) {
      const {userId,channelId} = event;
      return {userId,channelId,clientSubscriptionId};
    } else {
      rootValue.channel = leaveChannelChannel(fromGlobalId(globalChannelId).id);
      return null;
    }
  }
}
