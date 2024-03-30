import { makeExecutableSchema } from '@graphql-tools/schema';
import express from "express";
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import { PubSub } from 'graphql-subscriptions';
const port = 4000;
const typeDefs = `
  type Comment {
    name: String!
    endDate: String!
  }

  type Query {
    sayHello: String!
  }

  type Mutation {
    createComment(
      name: String!
    ): String!
  }

  type Subscription {
    commentCreated: Comment!
  }
`;
const pubSub = new PubSub();
const resolvers = {
    Query: {
        sayHello() {
            return "Hello, world!";
        }
    },
    Subscription: {
        commentCreated: {
            subscribe: () => pubSub.asyncIterator(['COMMENT_CREATED'])
        }
    },
    Mutation: {
        createComment(parent, { name }) {
            // TODO: create comment
            pubSub.publish('COMMENT_CREATED', { commentCreated: {
                    name, endDate: new Date().toDateString(),
                } });
            return `Comentario: ${name} creado`;
        }
    }
};
const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
});
const wsServerClean = useServer({ schema }, wsServer);
const apolloServer = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await wsServerClean.dispose();
                    }
                };
            }
        }
    ]
});
await apolloServer.start();
app.use('/graphql', bodyParser.json(), expressMiddleware(apolloServer));
httpServer.listen(port, () => {
    console.log(`Listening on port: http://localhost:${port}/graphql`);
});
