import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"

// origen de datos 
const books = [
    {
        title: 'Titulo del libro 1',
        author: 'Rodry'
    },
    {
        title: 'Titulo del libro 2',
        author: 'Simeon'
    }
]


// Definicion de datos 
const typeDefs = `
type Book {
    type: String
    author: String
}

type Query {
    books: [Book]
}
`
// Resolver -> Solucionadores
const resolvers = {
    Query: {
        books: () => books
    }
}

// Mutaciones


// Suscripciones

const server = new ApolloServer({
    typeDefs, resolvers
})

const { url } = await startStandaloneServer(server, {
    listen: {port: 4000}
})
console.log(`Server ready at ${url}`)