import React, {createContext, useContext, useState} from 'react';

const ErrorContext = createContext(null);

export const ErrorProvider = ({children}) => {
    const [globalError, setGlobalError] = useState(null);
    return (
        <ErrorContext.Provider value={{globalError, setGlobalError}}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = () => useContext(ErrorContext);
