import {
	child,
	endAt,
	get,
	getDatabase,
	orderByChild,
	query,
	ref,
	startAt,
} from 'firebase/database';
import { getFirebaseApp } from '../firebaseHelper';

// Get user data from database
export const getUserData = async (userId) => {
	try {
		const app = getFirebaseApp();
		const dbRef = ref(getDatabase(app));
		const userRef = child(dbRef, `users/${userId}`);

		const snapshot = await get(userRef);
		return snapshot.val(); // Get actual data from snapshot
	} catch (error) {
		console.log(error);
	}
};

export const getUserChats = async (userId) => {
	try {
		const app = getFirebaseApp();
		const dbRef = ref(getDatabase(app));
		const userRef = child(dbRef, `userChats/${userId}`);

		const snapshot = await get(userRef);
		return snapshot.val();
	} catch (error) {
		console.log(error);
	}
};

// Search for users in the database
export const searchUsers = async (queryText) => {
	const searchTerm = queryText.toLowerCase();

	try {
		const app = getFirebaseApp();
		const dbRef = ref(getDatabase(app));
		const userRef = child(dbRef, 'users');

		const queryRef = query(
			userRef,
			orderByChild('firstLast'), // Sort by firstLast
			startAt(searchTerm),
			/* 
				Recommended way to matches all values that start with searchTerm 
				to query in Firebase
			*/
			endAt(searchTerm + '\uf8ff')
		);

		// Query result will be an object of users
		const snapshot = await get(queryRef);

		if (snapshot.exists()) {
			return snapshot.val();
		}

		return {};
	} catch (error) {
		console.log(error);
		throw error;
	}
};
