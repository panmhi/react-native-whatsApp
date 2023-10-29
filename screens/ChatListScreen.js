import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import { useSelector } from 'react-redux';

const ChatListScreen = (props) => {
	// Receive selectedUserId from props when navigating from NewChatScreen
	const selectedUser = props.route?.params?.selectedUserId;

	// Get the logged in userData from redux store
	const userData = useSelector((state) => state.auth.userData);

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
		<View style={styles.container}>
			<Text>ChatListScreen</Text>
			<Button
				title='Go to chat screen'
				onPress={() => {
					props.navigation.navigate('ChatScreen');
				}}
			/>
		</View>
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
