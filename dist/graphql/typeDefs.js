export const typeDefs = `
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
    }
`;
