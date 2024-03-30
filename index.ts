import { makeExecutableSchema } from '@graphql-tools/schema';
import express from "express";
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser'
import { PubSub } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import CommentMongoose from './models/Comment.js';

const mongoDb = "mongodb+srv://grapgql:grapgql@cluster0.abmuy81.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const port = 4000;

const typeDefs = `
  type Comment {
    name: String!
    endDate: String!
  }

  type Query {
    getComment(id:ID!): Comment
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
    getComment: async (parent, {id}) => {
      return await CommentMongoose.findById(id)
    }
  },
  Subscription: {
    commentCreated: {
      subscribe: () => pubSub.asyncIterator(['COMMENT_CREATED'])
    }
  },
  Mutation: {
    async createComment(parent, { name }) {
      const endDate = new Date().toDateString()

      const newComment = new CommentMongoose({
        name:name,
        endDate: endDate
      })

      await newComment.save()
      pubSub.publish('COMMENT_CREATED', { commentCreated: {
        name, endDate: endDate
      }});
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

mongoose.set('strictQuery', false);
mongoose.connect(mongoDb);

httpServer.listen(port, () => {
  console.log(`Listening on port: http://localhost:${port}/graphql`);
});
