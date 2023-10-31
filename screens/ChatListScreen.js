import React, { useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import { shallowEqual, useSelector } from 'react-redux';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import DataItem from '../components/DataItem';
import colors from '../constants/colors';

const ChatListScreen = (props) => {
	// Receive selectedUserId from props when navigating from NewChatScreen
	const selectedUser = props.route?.params?.selectedUserId;
	const selectedUserList = props.route?.params?.selectedUsers;
	const chatName = props.route?.params?.chatName;

	// Get the logged in userData from redux store
	const userData = useSelector((state) => state.auth.userData);

	const storedUsers = useSelector((state) => state.users.storedUsers);

	// Get array of chats sorted by updated date
	const userChats = useSelector((state) => {
		const chatsData = state.chats.chatsData;
		return Object.values(chatsData).sort((a, b) => {
			return new Date(b.updatedAt) - new Date(a.updatedAt);
		});
	}, shallowEqual);

	// Add new chat button to header
	useEffect(() => {
		props.navigation.setOptions({
			headerRight: () => {
				return (
					<HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
						<Item
							title='New chat'
							iconName='create-outline'
							onPress={() => props.navigation.navigate('NewChat')}
						/>
					</HeaderButtons>
				);
			},
		});
	}, []);

	// Navigate to ChatScreen if there is a selectedUser
	useEffect(() => {
		if (!selectedUser && !selectedUserList) {
			return;
		}

		let chatData;
		let navigationProps;

		// If 1:1 chat, find the chat data
		if (selectedUser) {
			chatData = userChats.find(
				(cd) => !cd.isGroupChat && cd.users.includes(selectedUser)
			);
		}

		if (chatData) {
			navigationProps = { chatId: chatData.key }; // Get chat id
		} else {
			// If group chat or no chat data found, get an array of chat users id
			const chatUsers = selectedUserList || [selectedUser];
			if (!chatUsers.includes(userData.userId)) {
				chatUsers.push(userData.userId);
			}

			navigationProps = {
				newChatData: {
					users: chatUsers,
					isGroupChat: selectedUserList !== undefined,
					chatName, // Undefiend when it is 1:1 chat
				},
			};
		}

		props.navigation.navigate('ChatScreen', navigationProps);
	}, [props.route?.params]);

	return (
		<PageContainer>
			<PageTitle text='Chats' />
			<View>
				<TouchableOpacity
					onPress={() =>
						props.navigation.navigate('NewChat', { isGroupChat: true })
					}
				>
					<Text style={styles.newGroupText}>New Group</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={userChats}
				renderItem={(itemData) => {
					const chatData = itemData.item;
					const chatId = chatData.key;
					const isGroupChat = chatData.isGroupChat;

					let title = '';
					const subTitle = chatData.latestMessageText || 'New chat';
					let image = '';

					if (isGroupChat) {
						title = chatData.chatName;
					} else {
						const otherUserId = chatData.users.find(
							(uid) => uid !== userData.userId
						);
						const otherUser = storedUsers[otherUserId];

						if (!otherUser) return;

						title = `${otherUser.firstName} ${otherUser.lastName}`;
						image = otherUser.profilePicture;
					}

					return (
						<DataItem
							title={title}
							subTitle={subTitle}
							image={image}
							onPress={() =>
								props.navigation.navigate('ChatScreen', { chatId })
							}
						/>
					);
				}}
			/>
		</PageContainer>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	newGroupText: {
		color: colors.blue,
		fontSize: 17,
		marginBottom: 5,
	},
});

export default ChatListScreen;
