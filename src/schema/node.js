import {
  fromGlobalId,
  nodeDefinitions
} from 'graphql-relay';

import * as db from '../database';

const {nodeInterface: NodeInterface, nodeField: NodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    return db.load(type, id);
  }
);

export {
  NodeInterface,
  NodeField
}
