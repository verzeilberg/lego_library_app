import React, { useState } from 'react';
import {Alert } from 'react-native';
export default function handleSubmit(username,password){

    // Assuming platformAPI is your API endpoint
    const apiUrl = 'https://192.168.2.31/auth';

    // Assuming your API expects JSON data
    const data = {
        email: username,
        password: password
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if required
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            alert('succeeded');
            // Handle result from API, e.g., set user session, navigate to next screen, etc.
            console.log('Login successful', result);
        })
        .catch(error => {
            alert('failed')
            console.error('Error logging in:', error);
        });
};
