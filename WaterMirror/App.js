import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import './i18n';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { LanguageProvider } from './contexts/LanguageContext';
import i18n from './i18n';

import HomeScreen from './src/Home';
import CalcScreen from './src/Calc';
import ResultScreen from './src/Result';

const Stack = createStackNavigator();

// 建立一個包裝的 Navigator 組件
function AppNavigator() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={() => ({ 
          title: t('nav.home')
        })} 
      />
      <Stack.Screen 
        name="Calc" 
        component={CalcScreen} 
        options={() => ({ 
          title: t('nav.calc')
        })} 
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreen} 
        options={() => ({ 
          title: t('nav.result')
        })} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <NavigationContainer>
          <StatusBar hidden={false} />
          <AppNavigator />
        </NavigationContainer>
      </LanguageProvider>
    </I18nextProvider>
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
