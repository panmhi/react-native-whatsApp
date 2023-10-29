import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ChatSettingsScreen from '../screens/ChatSettingsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import NewChatScreen from '../screens/NewChatScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { getFirebaseApp } from '../utils/firebaseHelper';
import { child, get, getDatabase, off, onValue, ref } from 'firebase/database';
import { setChatsData } from '../store/chatSlice';
import { ActivityIndicator, View } from 'react-native';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import { setStoredUsers } from '../store/userSlice';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home screen with two tabs: ChatList and Settings
const TabNavigator = () => {
	return (
		<Tab.Navigator
			screenOptions={{ headerTitle: '', headerShadowVisible: false }}
		>
			<Tab.Screen
				name='ChatList'
				component={ChatListScreen}
				options={{
					tabBarLabel: 'Chats',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name='chatbubble-outline' size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name='Settings'
				component={SettingsScreen}
				options={{
					tabBarLabel: 'Settings',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name='settings-outline' size={size} color={color} />
					),
				}}
			/>
		</Tab.Navigator>
	);
};

// 1. Home screen 2. ChatScreen 3. ChatSettingsScreen
const StackNavigator = (props) => {
	return (
		<Stack.Navigator>
			<Stack.Group>
				<Stack.Screen
					name='Home'
					component={TabNavigator}
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name='ChatScreen'
					component={ChatScreen}
					options={{ headerTitle: '', headerBackTitle: 'Back' }}
				/>
				<Stack.Screen
					name='ChatSettings'
					component={ChatSettingsScreen}
					options={{ headerTitle: 'Settings', headerBackTitle: 'Back' }}
				/>
			</Stack.Group>

			<Stack.Group screenOptions={{ presentation: 'containedModal' }}>
				<Stack.Screen name='NewChat' component={NewChatScreen} />
			</Stack.Group>
		</Stack.Navigator>
	);
};

// Added database listeners to fetch chats and users data
const MainNavigator = (props) => {
	const dispatch = useDispatch();

	const [isLoading, setIsLoading] = useState(true);

	// Need user id to fetch userChats
	const userData = useSelector((state) => state.auth.userData);
	const storedUsers = useSelector((state) => state.users.storedUsers);

	useEffect(() => {
		console.log('Subscribing to firebase listeners');

		const app = getFirebaseApp();
		const dbRef = ref(getDatabase(app));
		const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
		const refs = [userChatsRef];

		onValue(userChatsRef, (querySnapshot) => {
			const chatIdsData = querySnapshot.val() || {};
			const chatIds = Object.values(chatIdsData); // Array of chatIds

			const chatsData = {};
			let chatsFoundCount = 0;

			for (let i = 0; i < chatIds.length; i++) {
				const chatId = chatIds[i];
				const chatRef = child(dbRef, `chats/${chatId}`);
				refs.push(chatRef);

				// Listen to each chat in Chats database
				onValue(chatRef, (chatSnapshot) => {
					chatsFoundCount++;

					const data = chatSnapshot.val();

					if (data) {
						data.key = chatSnapshot.key; // Add chatId as key to chat data

						// Get user data for each user in the chat
						data.users.forEach((userId) => {
							if (storedUsers[userId]) return; // User already exists in storedUsers

							const userRef = child(dbRef, `users/${userId}`);

							get(userRef).then((userSnapshot) => {
								const userSnapshotData = userSnapshot.val();
								// Save user data to redux users store
								dispatch(setStoredUsers({ newUsers: { userSnapshotData } }));
							});

							refs.push(userRef);
						});

						// Add chat data to chatsData object
						chatsData[chatSnapshot.key] = data;
					}

					if (chatsFoundCount >= chatIds.length) {
						// Save chats data to redux chats store
						dispatch(setChatsData({ chatsData }));
						setIsLoading(false);
					}
				});

				if (chatsFoundCount == 0) {
					setIsLoading(false);
				}
			}
		});

		return () => {
			console.log('Unsubscribing firebase listeners');
			refs.forEach((ref) => off(ref));
		};
	}, []);

	if (isLoading) {
		<View style={commonStyles.center}>
			<ActivityIndicator size={'large'} color={colors.primary} />
		</View>;
	}

	return <StackNavigator />;
};

export default MainNavigator;
