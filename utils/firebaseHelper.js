// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

export const getFirebaseApp = () => {
	// TODO: Add SDKs for Firebase products that you want to use
	// https://firebase.google.com/docs/web/setup#available-libraries

	// Your web app's Firebase configuration
	// For Firebase JS SDK v7.20.0 and later, measurementId is optional
	const firebaseConfig = {
		apiKey: 'AIzaSyCGVhlmEfwsuSmUJWIgQrq1Hr5oy2smQ34',
		authDomain: 'react-native-whatsapp-de8a3.firebaseapp.com',
		databaseURL:
			'https://react-native-whatsapp-de8a3-default-rtdb.firebaseio.com',
		projectId: 'react-native-whatsapp-de8a3',
		storageBucket: 'react-native-whatsapp-de8a3.appspot.com',
		messagingSenderId: '639700182720',
		appId: '1:639700182720:web:d0fdd9cc5fa38fb7acaf25',
		measurementId: 'G-D72K1R31JE',
	};

	// Initialize Firebase
	return initializeApp(firebaseConfig);
};
