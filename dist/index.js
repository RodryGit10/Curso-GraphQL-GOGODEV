import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { v1 as uuid } from 'uuid';
import { GraphQLError } from "graphql";
const users = [
    {
        id: 1,
        name: 'Rodry',
        surname: 'Carita Aspi',
        street: 'Mecapaca',
        zipCode: 3154,
        city: 'La Paz',
        phone: '71242948'
    },
    {
        id: 2,
        name: 'Simeon',
        surname: 'Carita Aspi',
        street: 'Mecapaca',
        zipCode: 3154,
        city: 'La Paz',
        phone: '71242948'
    }
];
const typeDefs = `
    type User {
        id: ID!
        name: String!
        surname: String!
        street: String!
        zipCode: Int!
        city: String!
        phone: String
        address: String
    }

    type Query {
        allUsers: [User]
        userCount: Int!
        findUsersByName(name: String): User
        findUsersById(id:ID!): User
    }

    type Mutation {
        addUser(
            name: String!
            surname: String!
            street: String!
            zipCode: Int!
            phone: String
            city: String!
        ): User
    }
`;
const resolvers = {
    User: {
        address: (parent) => `${parent.street}, ${parent.zipCode}, ${parent.city}`
    },
    Query: {
        allUsers: () => users,
        userCount: () => users.length,
        findUsersByName: (parent, args) => {
            const { name } = args;
            return users.find(user => user.name === name);
        },
        //findUsersById: (parent, args) => users.find(user => user.id === args.id),
        findUsersById: (parent, args) => {
            const { id } = args;
            return users.find(user => user.id === id);
        }
    },
    Mutation: {
        addUser: (parent, args) => {
            if (users.find(user => user.name === args.name)) {
                throw new GraphQLError(`El usuario con el mismo nosmbre ya existe`, {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                });
            }
            const user = { ...args, id: uuid() };
            users.push(user);
            return user;
        }
    }
};
const server = new ApolloServer({
    typeDefs, resolvers
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});
console.log(`Server ready at ${url}`);
