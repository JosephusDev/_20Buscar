import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Image, Dimensions } from 'react-native';
import { requestForegroundPermissionsAsync, getCurrentPositionAsync, LocationObject } from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker } from 'react-native-maps';
import {MaterialIcons} from '@expo/vector-icons'
import axios from 'axios';

interface Autocarro {
  id: number;
  nome: string;
  lat: string;
  lng: string;
}

const { width, height } = Dimensions.get('window');

export default function App() {

  const [location, setLocation] = useState<LocationObject | null >(null);
  const [autocarros, setAutocarros] = useState<Autocarro[]>([]);
  const [markerSelected, setMarkerSelected] = useState<any>(null);
  const mapRef = useRef<MapView>(null);
  const [mapVisible, setMapVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  async function requestLocationPermissions() {
    const { granted } = await requestForegroundPermissionsAsync();
    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
    }
  }

  const carregarAutocarros = async () => {
    const response = await axios.get(`https://kimpexpress.vercel.app/`);
    setAutocarros(response.data);
    console.log(response.data);
  };

  useEffect(() => {
    requestLocationPermissions();
    carregarAutocarros();
  }, []);

  useEffect(()=>{
    if (markerSelected) {
      console.log(markerSelected.lat);
      mapRef.current?.animateCamera({
        pitch: 70,
        center: {
          latitude: parseFloat(markerSelected.lat),
          longitude: parseFloat(markerSelected.lng)
        },
      });
    } else {
      console.log("O marcador selecionado não foi encontrado.");
    }
  }, [markerSelected])


  return (
    <View style={styles.container}>
      {mapVisible ? (
        <View  style={{ flex: 1, width: width, alignItems: 'center' }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1, width: width }}
            initialRegion={{
              latitude: -7.6140787,
              longitude: 15.0513794,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation
            loadingEnabled
            mapType='standard'
          >
            {autocarros.length > 0 && autocarros.map((autocarro: Autocarro) => (
              <Marker
                key={autocarro.id}
                title={autocarro.nome}
                description="Fique de olho nele."
                coordinate={{
                  latitude: parseFloat(autocarro.lat),
                  longitude: parseFloat(autocarro.lng)
                }}
                onPress={() => setMarkerSelected(autocarro)}
              ><MaterialIcons name="directions-bus" size={35} color="#FF5656" /></Marker>
            ))}
          </MapView>
          <Text style={{paddingTop: 5, paddingBottom: 5}}><MaterialIcons name="directions-bus" size={25} color="#FF5656" /></Text>
          <Text style={styles.label2}>Escolha o autocarro</Text>
          <Picker
            selectedValue={markerSelected}
            style={styles.picker}
            onValueChange={(value)=>setMarkerSelected(autocarros[value-1])}>
            <Picker.Item key={0} label="Selecione" value={0} />
            {Array.isArray(autocarros) && autocarros.map((auto) => (
              <Picker.Item key={auto.id} label={auto.nome} value={auto.id} />
            ))}
          </Picker>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Image source={require('./assets/icon.png')} style={{ width: 80, height: 120 }}/>
          <Text style={styles.heading}>20Buscar</Text>
          <ActivityIndicator size="large" color="#FF5656" />
          <Text style={styles.label}>Carregando o mapa...</Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Feito por JosephusDev e OliverGames - @2024</Text>
          </View>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5656',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 5
  },
  picker: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#FF5656',
    padding: 8,
    fontSize: 18,
    marginBottom: 5,
    width: '60%',
    color: '#94a3b8',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 20,
    color: "#000"
  },
  label2: {
    fontWeight: 'bold',
    fontSize: 15,
    color: "#FF5656"
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FF5656',
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});

