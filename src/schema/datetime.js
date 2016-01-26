import moment from 'moment';

import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql';

export const DateTimeType = new GraphQLObjectType({
  name: 'DateTime',
  fields: () => ({
    format: {
      type: GraphQLString,
      args: {
        string: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve: (dt, {string}) => moment(dt).format(string)
    }
  })
});
