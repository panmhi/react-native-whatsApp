import {
	View,
	StyleSheet,
	ImageBackground,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import backgroundImage from '../assets/images/droplet.jpeg';
import colors from '../constants/colors';
import { useCallback, useState } from 'react';

const ChatScreen = (props) => {
	const [messageText, setMessageText] = useState('');

	const sendMessage = useCallback(() => {
		setMessageText('');
	}, [messageText]);

	const handleOnPress = () => {};
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
				></ImageBackground>

				<View style={styles.inputContainer}>
					<TouchableOpacity style={styles.mediaButton} onPress={handleOnPress}>
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
