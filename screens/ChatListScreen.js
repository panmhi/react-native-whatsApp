import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import { useSelector } from 'react-redux';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import DataItem from '../components/DataItem';

const ChatListScreen = (props) => {
	// Receive selectedUserId from props when navigating from NewChatScreen
	const selectedUser = props.route?.params?.selectedUserId;

	// Get the logged in userData from redux store
	const userData = useSelector((state) => state.auth.userData);

	const storedUsers = useSelector((state) => state.users.storedUsers);

	// Get array of chats sorted by updated date
	const userChats = useSelector((state) => {
		const chatsData = state.chats.chatsData;
		return Object.values(chatsData).sort((a, b) => {
			return new Date(b.updatedAt) - new Date(a.updatedAt);
		});
	});

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
		if (!selectedUser) {
			return;
		}

		// selectedUser: the user id to talk to
		// userData.userId: the user id of the logged in user
		const chatUsers = [selectedUser, userData.userId];

		// props.newChatData = { users: [id1, id2]}
		const navigationProps = {
			newChatData: { users: chatUsers },
		};

		props.navigation.navigate('ChatScreen', navigationProps);
	}, [props.route?.params]);

	return (
		<PageContainer>
			<PageTitle text='Chats' />

			<FlatList
				data={userChats}
				renderItem={(itemData) => {
					const chatData = itemData.item;
					const chatId = chatData.key;

					const otherUserId = chatData.users.find(
						(uid) => uid !== userData.userId
					);
					const otherUser = storedUsers[otherUserId];

					if (!otherUser) return;

					const title = `${otherUser.firstName} ${otherUser.lastName}`;
					const subTitle = 'This will be a message..';
					const image = otherUser.profilePicture;

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
});

export default ChatListScreen;
