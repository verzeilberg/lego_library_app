import { View, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';

const fetchBoardItems = async (bordId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${Config.API_BASE_URL}/api/set-lists/${bordId}`, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

const GridImage = ({ uri, resizeMode }) => (
  <Image
    source={{ uri }}
    style={{ width: '100%', height: '100%' }}
    resizeMode={resizeMode}
  />
);

const Grid2 = ({ images, resizeMode }) => (
  <View style={{ flex: 1, flexDirection: 'row' }}>
    <View style={{ flex: 1, overflow: 'hidden', borderRightWidth: 1, borderColor: 'white' }}>
      <GridImage uri={images[0]} resizeMode={resizeMode} />
    </View>
    <View style={{ flex: 1, overflow: 'hidden', borderLeftWidth: 1, borderColor: 'white' }}>
      <GridImage uri={images[1]} resizeMode={resizeMode} />
    </View>
  </View>
);

const Grid3 = ({ images, resizeMode }) => (
  <View style={{ flex: 1 }}>
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 1, overflow: 'hidden', borderRightWidth: 1, borderBottomWidth: 1, borderColor: 'white' }}>
        <GridImage uri={images[0]} resizeMode={resizeMode} />
      </View>
      <View style={{ flex: 1, overflow: 'hidden', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: 'white' }}>
        <GridImage uri={images[1]} resizeMode={resizeMode} />
      </View>
    </View>
    <View style={{ flex: 1, alignItems: 'center', borderTopWidth: 1, borderColor: 'white' }}>
      <View style={{ width: '50%', height: '100%', overflow: 'hidden' }}>
        <GridImage uri={images[2]} resizeMode={resizeMode} />
      </View>
    </View>
  </View>
);

const Grid4 = ({ images, resizeMode }) => (
  <View style={{ flex: 1 }}>
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 1, overflow: 'hidden', borderRightWidth: 1, borderBottomWidth: 1, borderColor: 'white' }}>
        <GridImage uri={images[0]} resizeMode={resizeMode} />
      </View>
      <View style={{ flex: 1, overflow: 'hidden', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: 'white' }}>
        <GridImage uri={images[1]} resizeMode={resizeMode} />
      </View>
    </View>
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 1, overflow: 'hidden', borderRightWidth: 1, borderTopWidth: 1, borderColor: 'white' }}>
        <GridImage uri={images[2]} resizeMode={resizeMode} />
      </View>
      <View style={{ flex: 1, overflow: 'hidden', borderLeftWidth: 1, borderTopWidth: 1, borderColor: 'white' }}>
        <GridImage uri={images[3]} resizeMode={resizeMode} />
      </View>
    </View>
  </View>
);

const SetImageOverlay = ({ setImages, style, resizeMode }) => {
  const count = Math.min(setImages.length, 4);
  if (count === 0) return null;

  if (count === 1) {
    return (
      <Image
        source={{ uri: setImages[0] }}
        style={style}
        resizeMode={resizeMode}
      />
    );
  }

  return (
    <View style={[style, { overflow: 'hidden' }]}>
      {count === 2 && <Grid2 images={setImages} resizeMode={resizeMode} />}
      {count === 3 && <Grid3 images={setImages} resizeMode={resizeMode} />}
      {count === 4 && <Grid4 images={setImages} resizeMode={resizeMode} />}
    </View>
  );
};

export default function BoardImage({ bord, items: itemsProp, style, resizeMode = 'cover' }) {
  const [fetchedItems, setFetchedItems] = useState(null);
  const items = itemsProp || fetchedItems;

  useEffect(() => {
    let cancelled = false;
    if (!bord.filePath && !itemsProp) {
      fetchBoardItems(bord.id).then(data => {
        if (cancelled) return;
        setFetchedItems(Array.isArray(data) ? data : []);
      });
    }
    return () => { cancelled = true; };
  }, [bord, itemsProp]);

  if (bord.filePath) {
    return (
      <Image
        source={{ uri: `${Config.API_BASE_URL}${bord.filePath}` }}
        style={style}
        resizeMode={resizeMode}
      />
    );
  }

  const setImages = (items || [])
    .filter(item => item.isSet && item.filePath)
    .map(item => `${Config.API_BASE_URL}${item.filePath}`);

  return <SetImageOverlay setImages={setImages} style={style} resizeMode={resizeMode} />;
}
