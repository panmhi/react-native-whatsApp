import { NavigationContainer } from '@react-navigation/native';

import MainNavigator from './MainNavigator';
import AuthScreen from '../screens/AuthScreen';
import { useSelector } from 'react-redux';
import StartUpScreen from '../screens/StartUpScreen';

const AppNavigator = (props) => {
	const isAuth = useSelector(
		(state) => state.auth.token !== null && state.auth.token !== ''
	);
	const didTryAutoLogin = useSelector((state) => state.auth.didTryAutoLogin);

	return (
		<NavigationContainer>
			{isAuth && <MainNavigator />}
			{/* Show auth screen if we are not authenticated and tried auto login already */}
			{!isAuth && didTryAutoLogin && <AuthScreen />}
			{/* Try auto login if we haven't done so  */}
			{!isAuth && !didTryAutoLogin && <StartUpScreen />}
		</NavigationContainer>
	);
};

export default AppNavigator;
