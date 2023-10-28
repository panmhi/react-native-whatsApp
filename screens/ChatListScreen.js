import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const ChatListScreen = (props) => {
	const handleOnPress = () => {
		props.navigation.navigate('ChatScreen');
	};

	return (
		<View style={styles.container}>
			<Text>ChatListScreen</Text>
			<Button title='Go to chat screen' onPress={handleOnPress} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
});

export default ChatListScreen;
