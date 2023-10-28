export const reducer = (state, action) => {
	const { validationResult, inputId, inputValue } = action;

	// Updated inputValues
	const updatedValues = {
		...state.inputValues,
		[inputId]: inputValue,
	};

	// Updated inputValidities
	const updatedValidities = {
		...state.inputValidities,
		[inputId]: validationResult,
	};

	let updatedFormIsValid = true;

	// Update formIsValid based on updated inputValidities
	for (const key in updatedValidities) {
		if (updatedValidities[key] !== undefined) {
			updatedFormIsValid = false;
			break;
		}
	}

	return {
		inputValues: updatedValues,
		inputValidities: updatedValidities,
		formIsValid: updatedFormIsValid,
	};
};
