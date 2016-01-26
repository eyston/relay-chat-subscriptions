import R from 'ramda';

import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  globalIdField
} from 'graphql-relay';

import * as db from '../database';

import {NodeInterface} from './node';
import {ChannelType,ChannelConnection} from './channel';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: globalIdField('User'),
    name: {type: GraphQLString},
    defaultChannel: {type: ChannelType, resolve: db.resolve },
    channels: {
      type: ChannelConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(R.sortBy(R.prop('name'), db.loadAll('Channel')), args)
    }
  }),
  isTypeOf: (obj) => obj instanceof db.User,
  interfaces: () => [NodeInterface]
});

const {
  connectionType: UserConnection,
  edgeType: UserEdge
} = connectionDefinitions({
  name: 'User',
  nodeType: UserType
});

export {
  UserConnection,
  UserEdge
};

export const UserField = {
  type: UserType,
  args: {
    id: {type: new GraphQLNonNull(GraphQLID)}
  },
  resolve: (_, {id}) => db.load('User', id)
}

// default for graphiql
const viewerId = db.create('User', {name: 'Huey'}).id
export const ViewerField = {
  type: UserType,
  resolve: ({userId}) => db.load('User', userId || viewerId)
}
