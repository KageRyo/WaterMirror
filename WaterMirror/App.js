import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/Home';      // 首頁
import CalcScreen from './src/Calc';      // 水質資料填寫頁面
import ResultScreen from './src/Result';  // 查閱報表頁面

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar hidden={false} />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '首頁' }} />
        <Stack.Screen name="Calc" component={CalcScreen} options={{ title: '水質資料填寫' }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: '查閱報表' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               佛祖保佑         永無BUG