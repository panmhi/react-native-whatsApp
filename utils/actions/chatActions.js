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
import { addUserChat, deleteUserChat, getUserChats } from './userActions';
import { getUserPushTokens } from './authActions';

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
	const chatsRef = child(dbRef, 'chats');
	const newChat = await push(chatsRef, newChatData);

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
	replyTo,
	type
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
	 * 				type
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

	if (type) {
		messageData.type = type;
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
	senderData,
	messageText,
	replyTo,
	chatUsers
) => {
	await sendMessage(
		chatId,
		senderData.userId,
		messageText,
		null,
		replyTo,
		null
	);
	const otherUsers = chatUsers.filter((uid) => uid !== senderData.userId);
	await sendPushNotificationForUsers(
		otherUsers,
		`${senderData.firstName} ${senderData.lastName}`,
		messageText,
		chatId
	);
};

export const sendInfoMessage = async (chatId, senderId, messageText) => {
	await sendMessage(chatId, senderId, messageText, null, null, 'info');
};

export const sendImage = async (
	chatId,
	senderData,
	imageUrl,
	replyTo,
	chatUsers
) => {
	await sendMessage(
		chatId,
		senderData.userId,
		'Image',
		imageUrl,
		replyTo,
		null
	);

	const otherUsers = chatUsers.filter((uid) => uid !== senderData.userId);
	await sendPushNotificationForUsers(
		otherUsers,
		`${senderData.firstName} ${senderData.lastName}`,
		`${senderData.firstName} sent an image`,
		chatId
	);
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

// Remove user from a group chat: update chats, userChats and messages database
export const removeUserFromChat = async (
	userLoggedInData,
	userToRemoveData,
	chatData
) => {
	const userToRemoveId = userToRemoveData.userId;
	const newUsers = chatData.users.filter((uid) => uid !== userToRemoveId);
	await updateChatData(chatData.key, userLoggedInData.userId, {
		users: newUsers,
	});

	const userChats = await getUserChats(userToRemoveId);

	for (const key in userChats) {
		const currentChatId = userChats[key];

		if (currentChatId === chatData.key) {
			// Chat will be removed from the removed user's userChats data
			await deleteUserChat(userToRemoveId, key);
			break;
		}
	}

	const messageText =
		userLoggedInData.userId === userToRemoveData.userId
			? `${userLoggedInData.firstName} left the chat`
			: `${userLoggedInData.firstName} removed ${userToRemoveData.firstName} from the chat`;

	await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};

export const addUsersToChat = async (
	userLoggedInData,
	usersToAddData,
	chatData
) => {
	const existingUsers = Object.values(chatData.users); // array of ids
	const newUsers = [];

	let userAddedName = '';

	usersToAddData.forEach(async (userToAdd) => {
		const userToAddId = userToAdd.userId;

		if (existingUsers.includes(userToAddId)) return;

		newUsers.push(userToAddId);

		// Add chatId to the user's userChats data
		await addUserChat(userToAddId, chatData.key);

		userAddedName = `${userToAdd.firstName} ${userToAdd.lastName}`;
	});

	if (newUsers.length === 0) {
		return;
	}

	// Add to chats database
	await updateChatData(chatData.key, userLoggedInData.userId, {
		users: existingUsers.concat(newUsers),
	});

	// Add info message to messages database
	const moreUsersMessage =
		newUsers.length > 1 ? `and ${newUsers.length - 1} others ` : '';
	const messageText = `${userLoggedInData.firstName} ${userLoggedInData.lastName} added ${userAddedName} ${moreUsersMessage}to the chat`;
	await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};

const sendPushNotificationForUsers = (chatUsers, title, body, chatId) => {
	chatUsers.forEach(async (uid) => {
		console.log('test');
		const tokens = await getUserPushTokens(uid);

		for (const key in tokens) {
			const token = tokens[key];

			await fetch('https://exp.host/--/api/v2/push/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to: token,
					title,
					body,
					data: { chatId },
				}),
			});
		}
	});
};
