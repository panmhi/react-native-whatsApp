import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';

const ChatListScreen = (props) => {
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
		justifyContent: 'center',
	},
});

export default ChatListScreen;
