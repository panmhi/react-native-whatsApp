import {
	View,
	StyleSheet,
	ImageBackground,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import backgroundImage from '../assets/images/droplet.jpeg';
import colors from '../constants/colors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PageContainer from '../components/PageContainer';
import Bubble from '../components/Bubble';
import { useSelector } from 'react-redux';
import { createChat, sendTextMessage } from '../utils/actions/chatActions';

const ChatScreen = (props) => {
	const [chatUsers, setChatUsers] = useState([]);
	const [messageText, setMessageText] = useState('');
	const [chatId, setChatId] = useState(props.route?.params?.chatId);
	const [errorBannerText, setErrorBannerText] = useState('');

	const userData = useSelector((state) => state.auth.userData);
	const storedUsers = useSelector((state) => state.users.storedUsers);
	const storedChats = useSelector((state) => state.chats.chatsData);
	const storedMessages = useSelector((state) => state.messages.messagesData);
	const chatMessages = useMemo(() => {
		const messageList = [];

		if (!chatId) return messageList;

		const chatMessagesData = storedMessages[chatId];
		//  chatMessagesData: {
		// 	  [messageId]: {
		// 	      sentBy,
		// 	      sentAt,
		// 	      text
		// 	  }
		// 	}
		if (!chatMessagesData) return messageList;

		for (const key in chatMessagesData) {
			const message = chatMessagesData[key];

			/**
			 * messageList: [
			 * 	{
			 * 		key,
			 * 		sentBy,
			 * 		sentAt,
			 * 		text
			 * 	}
			 * ]
			 */
			messageList.push({
				key,
				...message,
			});
		}

		return messageList;
	}, [storedMessages]);

	// newChatData: { users: [userId1, userId2] }
	const chatData =
		(chatId && storedChats[chatId]) || props.route?.params?.newChatData;

	// Get the other user's name
	const getChatTitleFromName = () => {
		const otherUserId = chatUsers.find((uid) => uid !== userData.userId);
		const otherUserData = storedUsers[otherUserId];

		return (
			otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`
		);
	};

	// Store chat messages in the database
	const sendMessage = useCallback(async () => {
		try {
			let id = chatId;
			if (!id) {
				// No chat Id. Create the chat
				// newChatData: { users: [userId1, userId2] }
				id = await createChat(userData.userId, props.route.params.newChatData);
				setChatId(id);
			}
			await sendTextMessage(chatId, userData.userId, messageText);
			setMessageText('');
		} catch (error) {
			setErrorBannerText('Message failed to send');
			setTimeout(() => setErrorBannerText(''), 5000);
		}
	}, [messageText, chatId]);

	// Display the other user's name to the header
	useEffect(() => {
		props.navigation.setOptions({
			headerTitle: getChatTitleFromName(),
		});
		setChatUsers(chatData.users); // TODO -> BUG
	}, [chatUsers]);

	return (
		<SafeAreaView edges={['right', 'bottom', 'left']} style={styles.container}>
			<KeyboardAvoidingView
				style={styles.screen}
				behavior={Platform.OS === 'ios' ? 'padding' : null}
				keyboardVerticalOffset={100}
			>
				<ImageBackground
					source={backgroundImage}
					style={styles.backgroundImage}
				>
					{/* Display new chat message bubble on the top if chatId is null */}
					<PageContainer style={{ backgroundColor: 'transparent' }}>
						{!chatId && (
							<Bubble text='This is a new chat. Say hi!' type='system' />
						)}
						{errorBannerText !== '' && (
							<Bubble text={errorBannerText} type='error' />
						)}
						{chatId && (
							<FlatList
								data={chatMessages}
								renderItem={(itemData) => {
									const message = itemData.item;

									const isOwnMessage = message.sentBy === userData.userId;

									const messageType = isOwnMessage
										? 'myMessage'
										: 'theirMessage';

									return (
										<Bubble
											type={messageType}
											text={message.text}
											messageId={message.key}
											userId={userData.userId}
											chatId={chatId}
											date={message.sentAt}
										/>
									);
								}}
							/>
						)}
					</PageContainer>
				</ImageBackground>

				<View style={styles.inputContainer}>
					<TouchableOpacity
						style={styles.mediaButton}
						onPress={() => console.log('Pressed!')}
					>
						<Feather name='plus' size={24} color={colors.blue} />
					</TouchableOpacity>

					<TextInput
						style={styles.textbox}
						value={messageText}
						onChangeText={(text) => setMessageText(text)}
						onSubmitEditing={sendMessage}
					/>

					{/* Show camera icon if messageText is empty */}
					{messageText === '' && (
						<TouchableOpacity style={styles.mediaButton}>
							<Feather name='camera' size={24} color={colors.blue} />
						</TouchableOpacity>
					)}

					{/* Show send icon if there is messageText */}
					{messageText !== '' && (
						<TouchableOpacity
							onPress={sendMessage}
							style={{ ...styles.mediaButton, ...styles.sendButton }}
						>
							<Feather name='send' size={20} color='white' />
						</TouchableOpacity>
					)}
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
	},
	screen: {
		flex: 1,
	},
	backgroundImage: {
		flex: 1,
	},
	inputContainer: {
		flexDirection: 'row',
		paddingVertical: 8,
		paddingHorizontal: 10,
		height: 50,
	},
	textbox: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 50,
		borderColor: colors.lightGrey,
		marginHorizontal: 15,
		paddingHorizontal: 12,
	},
	mediaButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 35,
	},
	sendButton: {
		backgroundColor: colors.blue,
		borderRadius: 50,
		padding: 8,
		width: 35,
	},
});

export default ChatScreen;
