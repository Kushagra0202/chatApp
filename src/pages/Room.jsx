import React, { useEffect, useState } from 'react';
import client, { databases, DATABASE_ID, COLLECTION_ID_MESSAGES } from '../appwriteConfig';
import {ID,Query,Role,Permission} from 'appwrite'
import {Trash2} from 'react-feather'
import Header from '../components/Header';
import { useAuth } from '../utils/AuthContext';

function Room() {
    const [messages, setMessages] = useState([]);
    const[messageBody,setmessageBody] = useState('');

    const {user} = useAuth()

    useEffect(() => {
        getMessages();

      const unsubsribe=  client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`,response =>{
            if(response.events.includes("databases.*.collections.*.documents.*.create")){
                console.log("Message was created")
                setMessages(prevState => [response.payload, ...prevState])

            }
            if(response.events.includes("databases.*.collections.*.documents.*.delete")){
                console.log("Message was deleted");
                console.log(response)
                setMessages(prevState => prevState.filter(message=>message.$id !== response.payload.$id))
            }
        });

        return ()=>{
            unsubsribe()
        }

    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let payload = {
            user_id : user.$id,
            name : user.name,
            Body: messageBody,
        };

        let permission = [
            Permission.write(Role.user(user.$id))
        ]
    
        try {
            // Create the message
            let response = await databases.createDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, ID.unique(), payload,permission);
            console.log('Created!', response);
    
            // Fetch the updated list of messages after creating the message
            const updatedMessagesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_MESSAGES,[Query.orderDesc('$createdAt')]);
           // setMessages(updatedMessagesResponse.documents);
        } catch (error) {
            console.error('Error creating message:', error);
        }
    
        // Clear the message body input
        setmessageBody('');
    };
    

    const getMessages = async () => {
        try {
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_MESSAGES,[Query.orderDesc('$createdAt')]);
            setMessages(response.documents);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const deleteMessage = (message_id)=>{
         databases.deleteDocument(DATABASE_ID,COLLECTION_ID_MESSAGES,message_id)
       // setMessages(prevState => messages.filter(message=>message.$id !== message_id))
    }

    return (
        <main className='container'>
            <Header/>
            <div className='room--container'>

               <form onSubmit={handleSubmit}>
                <div>
                    <textarea
                    required
                    maxLength='1000'
                    placeholder='Say Something....'
                    onChange={(e)=>{setmessageBody(e.target.value)}}
                    value={messageBody}
                    >
                    </textarea>
                </div>
                <div className='send-btn--wrapper'>
                    <input className='btn btn--secondary' type='submit' value="Send"/>
                </div>
               </form>


            <div>
                {messages.map((message) => (
                    <div key={message.$id} className='message--wrapper'>
                        <div className='message--header'>
                            <p>
                                {message?.name?(
                                    <span>{message.name}</span>
                                ):(
                                    <span>Unknown user</span>
                                )}
                                <small className='message-timestamp'>{ new Date(message.$createdAt).toLocaleString() }</small> 
                            </p>

                            {message.$permissions.includes(`delete(\"user:${user.$id}\")`) && (
                                <Trash2 className='delete--btn ' onClick={()=>{deleteMessage(message.$id)}}/>
                            )}
                        </div>
                        <div className='message--body'>
                            <span>{message.Body}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </main>
        
    );
}

export default Room;

