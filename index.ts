import { makeExecutableSchema } from '@graphql-tools/schema';
import express from "express";
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser'

const port = 4000

const typeDefs = `
  
`

const resolvers = {

}

const schema = makeExecutableSchema({typeDefs, resolvers})
const app = express()
const httpServer = createServer(app)
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})
const wsServerClean = useServer({schema}, wsServer)

const apolloServer = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({httpServer}),
    {
      async serverWillStart() {
        return {
          async drainServer(){
            await wsServerClean.dispose()
          }
        }
      }
    }
  ]
})

await apolloServer.start()

app.use('/graphql', bodyParser.json(), expressMiddleware(apolloServer));
httpServer.listen(port, () => {
  console.log(`listening on port: http://localhost:${port}/graphql`)
})