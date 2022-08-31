import { readFileSync } from "fs";
import { ApolloServer, gql } from "apollo-server";
import { buildSubgraphSchema } from "@apollo/subgraph";

const port = process.env.USERS_PORT || 4002;
const users = [
  {
    email: "support@apollographql.com",
    name: "Apollo Studio Support",
    totalProductsCreated: 10,
    yearsOfEmployment: 10
  },
];

const typeDefs = gql(readFileSync("users.graphql", "utf-8"));

class BasicLogging {
  requestDidStart({queryString, parsedQuery, variables}) {
    cString || print(parsedQuery);
    console.log(query);
    console.log(variables);
  }

  willSendResponse({graphqlResponse}) {
    console.log(JSON.stringify(graphqlResponse, null, 2));
  }
}

const resolvers = {
  Query: {
      product: () => {
        return users;
      },
  },
  User: {
    
    /** @type {(reference: import("./typings").UserReference) => any} */
    __resolveReference: (reference) => {
      return users.find((u) => u.email == reference.email);
    },
  },
};
const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers, extensions: new BasicLogging() }),
});
server
  .listen({ port })
  .then(({ url }) => console.log(`Users subgraph ready at ${url}`));
