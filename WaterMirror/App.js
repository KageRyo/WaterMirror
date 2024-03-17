import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/Home'; // 如果這是您首頁的文件名，請替換
import WaterQualityScreen from './src/Calc'; // 如果這是您水質資料填寫頁面的文件名，請替換

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '首頁' }} />
        <Stack.Screen name="Calc" component={WaterQualityScreen} options={{ title: '水質資料填寫' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
