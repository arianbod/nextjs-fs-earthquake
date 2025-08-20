// File: /context/UserInputContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const UserInputContext = createContext();

const STORAGE_KEY = 'quakewise_assessment_data';

export const UserInputProvider = ({ children }) => {
	const getDefaultState = () => ({
		location: null,
		address: '',
		latitude: null,
		longitude: null,
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
		// New fields for improved building definition
		buildingLength: '',
		buildingWidth: '',
		storyHeight: '',
		columnSpacing: '',
		buildingType: '',
		dataSource: '', // 'auto-detected', 'ai-analysis', 'template', 'manual'
		confidence: null,
	});

	const [userInput, setUserInput] = useState(getDefaultState);
	const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

	// Load data from localStorage on mount (client-side only)
	useEffect(() => {
		try {
			const savedData = localStorage.getItem(STORAGE_KEY);
			if (savedData) {
				const parsedData = JSON.parse(savedData);
				console.log('Loaded data from localStorage:', parsedData);
				setUserInput(parsedData);
			}
		} catch (error) {
			console.warn('Failed to load saved assessment data:', error);
		} finally {
			setHasLoadedFromStorage(true);
		}
	}, []);

	// Save to localStorage whenever userInput changes (but only after initial load)
	useEffect(() => {
		// Don't save until we've loaded from storage first
		if (!hasLoadedFromStorage) return;

		try {
			// Only save if we have some meaningful data
			if (userInput && (userInput.numberOfStories > 0 || userInput.address || userInput.structuralSystem)) {
				console.log('Saving data to localStorage:', userInput);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(userInput));
			}
		} catch (error) {
			console.warn('Failed to save assessment data:', error);
		}
	}, [userInput, hasLoadedFromStorage]);

	const updateUserInput = (newData) => {
		setUserInput((prevData) => ({ ...prevData, ...newData }));
	};

	const clearSavedData = () => {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear saved assessment data:', error);
		}
	};

	const value = {
		userInput,
		updateUserInput,
		clearSavedData,
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
