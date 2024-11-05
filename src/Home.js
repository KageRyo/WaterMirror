import React from 'react';
import { Alert, Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View, ActionSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { ActionSheetProvider, useActionSheet } from '@expo/react-native-action-sheet';

import GitHubMark from '../assets/github-mark.png';
const githubUrl = 'https://github.com/KageRyo/WaterMirror';

// 頂部區塊
const TopSection = () => {
  const { t } = useTranslation();
  
  return (
    <View style={topStyles.top}>
      <Text style={topStyles.title}>{t('app.name')}</Text>
      <Text style={topStyles.subtitle}>{t('app.subtitle')}</Text>
      <Text style={topStyles.platform}>
        {t('app.version', { platform: Platform.OS })}
      </Text>
    </View>
  );
};

// 按鈕區塊
const BtnSection = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { showActionSheetWithOptions } = useActionSheet();
  
  const handleLanguageSwitch = () => {
    const options = [
      {
        text: '正體中文',
        onPress: () => changeLanguage('zh-TW')
      },
      {
        text: '简体中文',
        onPress: () => changeLanguage('zh-CN')
      },
      {
        text: 'English',
        onPress: () => changeLanguage('en')
      },
      {
        text: '日本語',
        onPress: () => changeLanguage('ja')
      },
      {
        text: t('buttons.cancel'),
        style: 'cancel'
      }
    ];

    // 使用 ActionSheet 顯示選單
    const buttonTitles = options.map(option => option.text);
    showActionSheetWithOptions(
      {
        options: buttonTitles,
        cancelButtonIndex: options.length - 1,
        title: t('language.select')
      },
      buttonIndex => {
        if (buttonIndex !== options.length - 1) {
          options[buttonIndex].onPress();
        }
      }
    );
  };
  
  const btnData = [
    {
      text: t('buttons.inputData'),
      route: 'Calc',
      bgColor: '#FFB6C1',
    },
    {
      text: t('buttons.viewReport'),
      route: 'Result',
      bgColor: '#98FB98',
    },
    {
      text: t('buttons.contactAuthor'),
      route: 'https://kageryo.coderyo.com/',
      bgColor: '#ADD8E6',
    },
    {
      text: t('buttons.tutorial'),
      route: 'https://www.youtube.com/@WaterMirror-NUTC',
      bgColor: '#FFD700',
    },
  ];

  const handlePress = async (route) => {
    if (route === 'Result') {
      try {
        const data = await AsyncStorage.getItem('waterQualityData');
        const assessment = await AsyncStorage.getItem('waterQualityAssessment');
        if (!data || !assessment) {
          Alert.alert(t('alerts.notice'), t('alerts.pleaseInputData'));
          return;  // 如果沒有資料，直接返回，不執行導航
        }
        navigation.navigate(route, { 
          data: JSON.parse(data), 
          assessment: JSON.parse(assessment) 
        });
      } catch (error) {
        Alert.alert(t('alerts.notice'), t('alerts.pleaseInputData'));
        return;
      }
    } else if (route.startsWith('http') || route.startsWith('mailto:')) {
      try {
        await Linking.openURL(route);
      } catch {
        // 不執行任何操作以隱藏錯誤訊息
      }
    } else {
      navigation.navigate(route);
    }
  };

  return (
    <View style={btnStyles.btnContainer}>
      <View style={btnStyles.btnRow}>
        <CustomBtn {...btnData[0]} onPress={() => handlePress(btnData[0].route)} />
        <View style={btnStyles.btnSpace} />
        <CustomBtn {...btnData[1]} onPress={() => handlePress(btnData[1].route)} />
      </View>
      <View style={btnStyles.btnRow}>
        <CustomBtn {...btnData[2]} onPress={() => handlePress(btnData[2].route)} />
        <View style={btnStyles.btnSpace} />
        <CustomBtn {...btnData[3]} onPress={() => handlePress(btnData[3].route)} />
      </View>
      <View style={btnStyles.langBtnRow}>
        <CustomBtn 
          text={t('buttons.switchLanguage')} 
          bgColor="#E6E6FA" 
          onPress={handleLanguageSwitch} 
          isLangBtn={true} 
        />
      </View>
    </View>
  );
};

// 自訂按鈕元件
const CustomBtn = ({ bgColor, text, onPress, isLangBtn }) => {
  return (
    <TouchableOpacity 
      style={[
        btnStyles.btn, 
        { backgroundColor: bgColor },
        isLangBtn && btnStyles.langBtn
      ]} 
      onPress={onPress}
    >
      <Text style={btnStyles.btnText}>{text}</Text>
    </TouchableOpacity>
  );
};

// 底部區塊
const BottomSection = () => {
  return (
    <View style={bottomStyles.bottom}>
      <Text style={bottomStyles.blue}>本專案由國立臺中科技大學</Text>
      <Text style={[bottomStyles.blue, bottomStyles.bottomText]}>智慧生產工程系 張健勳, 吳國維 進行開發</Text>
      <Text style={bottomStyles.bottomText}>若有任何問題，歡迎到本專案GitHub頁面！</Text>
      <TouchableOpacity onPress={openGitHub}>
        <Image source={GitHubMark} style={bottomStyles.githubImg} />
      </TouchableOpacity>
    </View>
  );
};

// 開啟 GitHub 連結
const openGitHub = () => {
  Linking.openURL(githubUrl);
};

// 畫面視窗
export function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TopSection />
      <View style={styles.content}>
        <BtnSection navigation={navigation} />
      </View>
      <BottomSection />
    </View>
  );
}

// 主樣式表
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});

// 頂部區塊樣式表
const topStyles = StyleSheet.create({
  top: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  platform: {
    fontSize: 16,
    color: 'blue',
  },
});

// 按鈕區塊樣式表
const btnStyles = StyleSheet.create({
  btnContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnRow: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  btn: {
    width: 150,
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  langBtn: {
    width: 320,
    height: 50,
  },
  btnText: {
    fontSize: 20,
  },
  btnSpace: {
    width: 20,
  },
});

// 底部區塊樣式表
const bottomStyles = StyleSheet.create({
  bottom: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  blue: {
    color: 'blue',
  },
  bottomText: {
    marginBottom: 10,
  },
  githubImg: {
    width: 50,
    height: 50,
  },
});

// 確保在應用的根組件中包裹 ActionSheetProvider
export default function App() {
  return (
    <ActionSheetProvider>
      <HomeScreen />
    </ActionSheetProvider>
  );
}
