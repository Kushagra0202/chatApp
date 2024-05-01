import { Client , Databases,Account} from 'appwrite';

const client = new Client();

export const PROJECT_ID='6630b79800328b01618c'
export const DATABASE_ID='6630b96d001617cf350c'
export const COLLECTION_ID_MESSAGES='6630b977001607311be3'

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6630b79800328b01618c');

    export const databases = new Databases(client)
    export const account = new Account(client)

    export default client;