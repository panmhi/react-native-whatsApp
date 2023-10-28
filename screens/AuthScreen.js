import React, { useState } from 'react';
import {
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	View,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageContainer from '../components/PageContainer';
import SignUpForm from '../components/SignUpForm';
import SignInForm from '../components/SignInForm';
import colors from '../constants/colors';

import logo from '../assets/images/logo.png';

const AuthScreen = (props) => {
	const [isSignUp, setIsSignUp] = useState(false);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView>
				<KeyboardAvoidingView
					style={styles.keyboardAvoidingView}
					behavior={Platform.OS === 'ios' ? 'height' : undefined}
				>
					<PageContainer>
						{/* Logo image */}
						<View style={styles.imageContainer}>
							<Image style={styles.image} source={logo} resizeMode='contain' />
						</View>
						{/* Form */}
						{isSignUp ? <SignUpForm /> : <SignInForm />}
						{/* Form switch button */}
						<TouchableOpacity
							onPress={() => setIsSignUp((prevState) => !prevState)}
							style={styles.linkContainer}
						>
							<Text style={styles.link}>{`Switch to ${
								isSignUp ? 'sign in' : 'sign up'
							}`}</Text>
						</TouchableOpacity>
					</PageContainer>
				</KeyboardAvoidingView>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	linkContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 15,
	},
	link: {
		color: colors.blue,
		fontFamily: 'medium',
		letterSpacing: 0.3,
	},
	imageContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: '50%',
	},
	keyboardAvoidingView: {
		flex: 1,
		justifyContent: 'center',
	},
});

export default AuthScreen;
