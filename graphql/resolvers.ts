
import fetch from 'node-fetch';
export const resolvers = {
    User: {
        address: (parent) => `${parent.street}, ${parent.zipCode}, ${parent.city}`
    },
    Query: {
        allUsers: async() => {
            const url = "https://grapgql-examplel.directus.app/items/users"
            const rawResponse = await fetch(url)
            const responde = await rawResponse.json()
            return responde.data
        }
    },

}