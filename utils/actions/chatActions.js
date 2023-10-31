import {
	child,
	get,
	getDatabase,
	push,
	ref,
	remove,
	set,
	update,
} from 'firebase/database';
import { getFirebaseApp } from '../firebaseHelper';

/*
	userChats: store chat ids for each user. Key is userId.
	chats: store users involved in each chat and time. Key is chatId.
	messages: store messages for each chat. Key is chatId.
*/

// Add chat to chats database
// Add involvled users to userChats database
export const createChat = async (loggedInUserId, chatData) => {
	const newChatData = {
		...chatData, // { users: [userId1, userId2] }
		createdBy: loggedInUserId,
		updatedBy: loggedInUserId,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	const app = getFirebaseApp();
	const dbRef = ref(getDatabase(app));
	/*
        chats: {
            [key]: {
                users: [],
                createdBy: '',
                updatedBy: '',
                createdAt: '',
                updatedAt: '',
				latestMessageText: ''
            }
        }
    */
	const newChat = await push(child(dbRef, 'chats'), newChatData);

	/*
        userChats: {
            [userId]: {
                [key]: chatId1,
                [key]: chatId2
            }
        }
    */
	const chatUsers = newChatData.users;
	for (let i = 0; i < chatUsers.length; i++) {
		const userId = chatUsers[i];
		await push(child(dbRef, `userChats/${userId}`), newChat.key);
	}

	return newChat.key;
};

export const updateChatData = async (chatId, userId, chatData) => {
	const app = getFirebaseApp();
	const dbRef = ref(getDatabase(app));
	const chatRef = child(dbRef, `chats/${chatId}`);

	await update(chatRef, {
		...chatData,
		updatedAt: new Date().toISOString(),
		updatedBy: userId,
	});
};

// Add new message to messages database
// Update chat updated time and latestMessageText in the chats database
const sendMessage = async (
	chatId,
	senderId,
	messageText,
	imageUrl,
	replyTo
) => {
	const app = getFirebaseApp();
	const dbRef = ref(getDatabase());
	const messagesRef = child(dbRef, `messages/${chatId}`);
	/**
	 * 	messages: {
	 * 		[chatId]: {
	 * 			[messageId]: {
	 *  			sentBy,
	 * 				sentAt,
	 * 				text,
	 * 				replyTo: [messageId]
	 * 				imageUrl
	 * 			}
	 * 		}
	 * 	}
	 */
	const messageData = {
		sentBy: senderId,
		sentAt: new Date().toISOString(),
		text: messageText,
	};

	if (replyTo) {
		messageData.replyTo = replyTo;
	}

	if (imageUrl) {
		messageData.imageUrl = imageUrl;
	}

	// Add message to the messages database
	await push(messagesRef, messageData);

	// Update chat udpated time and latestMessageText in the chats database
	const chatRef = child(dbRef, `chats/${chatId}`);
	await update(chatRef, {
		updatedBy: senderId,
		updatedAt: new Date().toISOString(),
		latestMessageText: messageText,
	});
};

export const sendTextMessage = async (
	chatId,
	senderId,
	messageText,
	replyTo
) => {
	await sendMessage(chatId, senderId, messageText, null, replyTo);
};

export const sendImage = async (chatId, senderId, imageUrl, replyTo) => {
	await sendMessage(chatId, senderId, 'Image', imageUrl, replyTo);
};

// Add or remove starred message in userStarredMessages database
export const starMessage = async (messageId, chatId, userId) => {
	try {
		const app = getFirebaseApp();
		const dbRef = ref(getDatabase(app));
		const childRef = child(
			dbRef,
			`userStarredMessages/${userId}/${chatId}/${messageId}`
		);

		const snapshot = await get(childRef);

		if (snapshot.exists()) {
			// Starred item exists - Un-star
			await remove(childRef);
		} else {
			// Starred item does not exist - star
			const starredMessageData = {
				messageId,
				chatId,
				starredAt: new Date().toISOString(),
			};

			await set(childRef, starredMessageData);
		}
	} catch (error) {
		console.log(error);
	}
};
