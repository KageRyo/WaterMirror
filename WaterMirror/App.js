import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/Home';  // 首頁
import WaterQualityScreen from './src/Calc';  // 水質資料填寫頁面

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar hidden={false} />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '首頁' }} />
        <Stack.Screen name="Calc" component={WaterQualityScreen} options={{ title: '水質資料填寫' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
