import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatSettingsScreen = (props) => {
	return (
		<View style={styles.container}>
			<Text>ChatSettingsScreen</Text>
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

export default ChatSettingsScreen;
