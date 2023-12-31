import 'react-native-gesture-handler';
import { useCallback, useEffect, useState } from 'react';
import { LogBox, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { MenuProvider } from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';

LogBox.ignoreLogs(['AsyncStorage has been extracted']);
// AsyncStorage.clear();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
	const [appIsLoaded, setAppIsLoaded] = useState(false);

	useEffect(() => {
		const loadFonts = async () => {
			try {
				await Font.loadAsync({
					black: require('./assets/fonts//Roboto-Black.ttf'),
					blackItalic: require('./assets/fonts/Roboto-BlackItalic.ttf'),
					bold: require('./assets/fonts/Roboto-Bold.ttf'),
					boldItalic: require('./assets/fonts/Roboto-BoldItalic.ttf'),
					italic: require('./assets/fonts/Roboto-Italic.ttf'),
					light: require('./assets/fonts/Roboto-Light.ttf'),
					lightItalic: require('./assets/fonts/Roboto-LightItalic.ttf'),
					medium: require('./assets/fonts/Roboto-Medium.ttf'),
					mediumItalic: require('./assets/fonts/Roboto-MediumItalic.ttf'),
					regular: require('./assets/fonts/Roboto-Regular.ttf'),
					thin: require('./assets/fonts/Roboto-Thin.ttf'),
					thinItalic: require('./assets/fonts/Roboto-ThinItalic.ttf'),
				});
			} catch (error) {
				console.log(error);
			} finally {
				setAppIsLoaded(true);
			}
		};
		loadFonts();
	}, []);

	const onLayout = useCallback(async () => {
		if (appIsLoaded) {
			await SplashScreen.hideAsync();
		}
	}, [appIsLoaded]);

	// Added this so that the app layout will changes when appIsLoaded state changes
	if (!appIsLoaded) return null;

	return (
		<Provider store={store}>
			<SafeAreaProvider style={styles.container} onLayout={onLayout}>
				<MenuProvider>
					<AppNavigator />
				</MenuProvider>
			</SafeAreaProvider>
		</Provider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	label: {
		color: 'black',
		fontSize: 24,
		fontFamily: 'regular',
	},
});
