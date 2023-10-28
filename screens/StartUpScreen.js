import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { authenticate, setDidTryAutoLogin } from '../store/authSlice';
import { getUserData } from '../utils/actions/userActions';

const StartUpScreen = () => {
	const dispatch = useDispatch();

	// auto login user using stored token
	useEffect(() => {
		const tryLogin = async () => {
			// get userData from storage
			const storedAuthInfo = await AsyncStorage.getItem('userData');

			if (!storedAuthInfo) {
				dispatch(setDidTryAutoLogin());
				return;
			}

			// Parse string to JSON object
			const parsedData = JSON.parse(storedAuthInfo);
			const { token, userId, expiryDate: expiryDateString } = parsedData;

			// Parse string to Date object
			const expiryDate = new Date(expiryDateString);

			// Check if token is expired or if token or userId is missing
			if (expiryDate <= new Date() || !token || !userId) {
				dispatch(setDidTryAutoLogin());
				return;
			}

			// Get user data by Id from database
			const userData = await getUserData(userId);

			// Update auth state via redux authenticate action
			dispatch(authenticate({ token: token, userData }));
		};

		tryLogin();
	}, [dispatch]);

	return (
		<View style={commonStyles.center}>
			<ActivityIndicator size='large' color={colors.primary} />
		</View>
	);
};

export default StartUpScreen;
