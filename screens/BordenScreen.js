import {View, Text, Image, ScrollView} from "react-native";
import React, {useEffect, useState} from 'react';
import LoadingSpinner from "../components/Elements";
import {globalStyles} from "../styles";
import {checkToken, fetchData, fetchModelLists, selectAndUploadImage} from "../components/Functions";
import Config from "../config/config";
import AddModal from "../components/AddModal";

export default function BordenScreen({navigation}) {
    const [data, setData] = useState(null); // To store the fetched data
    const [loading, setLoading] = useState(true); // To show loading spinner
    const [error, setError] = useState(null); // To handle errors
    const [errorMessage, setErrorMessage] = useState(null);
    const reloadData = () => {
        fetchModelLists(setData, setError, setLoading);
    };

    /** Check token when the page is loaded **/
    useEffect(() => {
        reloadData();
    }, []);

    //If loading show spinner
    if (loading) {
        return <LoadingSpinner/>;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <View style={{flex: 1}}>
            <ScrollView contentContainerStyle={globalStyles.listContainer}>
                {data.length > 0 ? (
                    data.map(item => (
                        <View key={item.id} style={globalStyles.card}>
                            <Image source={{uri: Config.API_BASE_URL + item.filePath}}
                                   style={globalStyles.modelListImage}/>
                            <Text style={globalStyles.titleText}>{item.title}</Text>
                            <Text style={globalStyles.descriptionText}>{item.description}</Text>
                        </View>
                    ))
                ) : (
                    <View>
                        <Text style={globalStyles.titleText}>No data available</Text>
                    </View>
                )}
            </ScrollView>
            <AddModal onDataUpdated={reloadData} />
        </View>
    );

}
