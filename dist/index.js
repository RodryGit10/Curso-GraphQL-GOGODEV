import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// origen de datos 
const books = [
    {
        id: 1,
        title: 'Titulo del libro 1',
        author: 'Rodry'
    },
    {
        id: 2,
        title: 'Titulo del libro 2',
        author: 'Simeon'
    }
];
// Definicion de datos 
const typeDefs = `
type Book {
    id: ID!
    title: String
    author: String
}

type Query {
    books: [Book]
    book(id: ID!):Book
}
`;
// Resolver -> Solucionadores
const resolvers = {
    Query: {
        books: () => books,
        book: (parent, args) => books.find((book) => book.id == parseInt(args.id))
    }
};
// Mutaciones
// Suscripciones
const server = new ApolloServer({
    typeDefs, resolvers
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});
console.log(`Server ready at ${url}`);
