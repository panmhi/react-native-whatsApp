import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import React, { useEffect, useRef, useState } from 'react';
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
import { ActivityIndicator, View, Platform } from 'react-native';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import { setStoredUsers } from '../store/userSlice';
import { setChatMessages, setStarredMessages } from '../store/messagesSlice';
import ContactScreen from '../screens/ContactScreen';
import DataListScreen from '../screens/DataListScreen';
import { StackActions, useNavigation } from '@react-navigation/native';

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
				<Stack.Screen
					name='Contact'
					component={ContactScreen}
					options={{
						headerTitle: 'Contact info',
						headerBackTitle: 'Back',
					}}
				/>
				<Stack.Screen
					name='DataList'
					component={DataListScreen}
					options={{
						headerTitle: '',
						headerBackTitle: 'Back',
					}}
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
	const navigation = useNavigation();

	const dispatch = useDispatch();

	const [isLoading, setIsLoading] = useState(true);

	// Need user id to fetch userChats
	const userData = useSelector((state) => state.auth.userData);
	const storedUsers = useSelector((state) => state.users.storedUsers);

	const [expoPushToken, setExpoPushToken] = useState('');
	// console.log(expoPushToken)
	const notificationListener = useRef();
	const responseListener = useRef();

	// Push notifications
	useEffect(() => {
		registerForPushNotificationsAsync().then((token) =>
			setExpoPushToken(token)
		);

		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				// Handle received notification
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				const { data } = response.notification.request.content;
				const chatId = data['chatId'];

				if (chatId) {
					const pushAction = StackActions.push('ChatScreen', { chatId });
					navigation.dispatch(pushAction);
				} else {
					console.log('No chat id sent with notification');
				}
			});

		return () => {
			Notifications.removeNotificationSubscription(
				notificationListener.current
			);
			Notifications.removeNotificationSubscription(responseListener.current);
		};
	}, []);

	useEffect(() => {
		console.log('Subscribing to firebase listeners');

		const app = getFirebaseApp();
		const dbRef = ref(getDatabase(app));
		const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
		const refs = [userChatsRef];

		// Listen to logged in user's userChat data in database
		// Get relevant chats and users data based on userChat data and save to redux store
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
						if (!data.users.includes(userData.userId)) {
							return;
						}
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

				// Fetch messages associated with each chat
				const messagesRef = child(dbRef, `messages/${chatId}`);
				refs.push(messagesRef);
				onValue(messagesRef, (messagesSnapshot) => {
					const messagesData = messagesSnapshot.val();
					// Save messages data to redux messages store
					dispatch(setChatMessages({ chatId, messagesData }));
				});

				if (chatsFoundCount == 0) {
					setIsLoading(false);
				}
			}
		});

		// Listen to logged in user's starred messages
		const userStarredMessagesRef = child(
			dbRef,
			`userStarredMessages/${userData.userId}`
		);
		refs.push(userStarredMessagesRef);
		onValue(userStarredMessagesRef, (querySnapshot) => {
			const starredMessages = querySnapshot.val() ?? {};
			// Save starred messages data to redux messages store
			dispatch(setStarredMessages({ starredMessages }));
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

async function registerForPushNotificationsAsync() {
	let token;

	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
		});
	}

	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== 'granted') {
			alert('Failed to get push token for push notification!');
			return;
		}
		token = await Notifications.getExpoPushTokenAsync({
			projectId: Constants.expoConfig.extra.eas.projectId,
		});
	} else {
		console.log('Must use physical device for Push Notifications');
	}

	return token;
}
