import {graphql} from 'graphql';
import {schema} from '../schema';

export const channelForSubscription = async ({query, variables}) => {
  let rootValue = {};

  const response = await graphql(schema, query, rootValue, variables);

  return rootValue.channel;
}
