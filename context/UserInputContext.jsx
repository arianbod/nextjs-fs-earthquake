// File: /context/UserInputContext.js
'use client';

import React, { createContext, useContext, useState } from 'react';

const UserInputContext = createContext();

export const UserInputProvider = ({ children }) => {
	const [userInput, setUserInput] = useState({
		location: null,
		typeOfEarthquake: '',
		typeOfSoil: '',
		designRegulation: '',
		numberOfStories: 0,
		yearOfConstruction: '',
		structuralSystem: '',
		irregularity: '',
		planDimensions: [],
		manipulated: false,
		specificCondition: '',
		extraLoad: '',
		neighborBuildings: '',
	});

	const updateUserInput = (newData) => {
		setUserInput((prevData) => ({ ...prevData, ...newData }));
	};

	const value = {
		userInput,
		updateUserInput,
	};

	return (
		<UserInputContext.Provider value={value}>
			{children}
		</UserInputContext.Provider>
	);
};

export const useUserInput = () => {
	const context = useContext(UserInputContext);
	if (!context) {
		throw new Error('useUserInput must be used within a UserInputProvider');
	}
	return context;
};

export default UserInputContext;
