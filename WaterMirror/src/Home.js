import React from 'react';
import { View, Button, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GitHubMark from '../assets/github-mark.png';

// 定義導航到 GitHub 頁面的函式
const navigateToGitHub = () => {
  Linking.openURL('https://github.com/RotatingPotato/WaterMirror');
};

// 頂部文字組件
const TopSection = () => (
  <View style={styles.topContainer}>
    <Text style={styles.title}>WaterMirror</Text>
    <Text style={styles.subtitle}>智慧化水質分析工具</Text>
  </View>
);

// 按鈕組件
const ButtonSection = ({ navigation }) => (
  <View style={styles.buttonContainer}>
    <View style={styles.buttonRow}>
      <Button title="Button 1" onPress={() => navigation.navigate('Calc')} />
      <View style={styles.buttonSpace} />
      <Button title="Button 2" />
    </View>
    <View style={styles.buttonSpace} />
    <View style={styles.buttonRow}>
      <Button title="Button 3" />
      <View style={styles.buttonSpace} />
      <Button title="Button 4" />
    </View>
  </View>
);

// 下部分組件
const BottomSection = () => (
  <View style={styles.bottomContainer}>
    <Text style={styles.blueText}>本專案由國立臺中科技大學</Text>
    <Text style={[styles.blueText, { marginBottom: 10 }]}>智慧生產工程系 張健勳, 吳國維 進行開發</Text>
    <Text style={{ marginBottom: 10 }}>若有任何問題，歡迎到本專案GitHub頁面！</Text>
    <TouchableOpacity onPress={navigateToGitHub}>
      <Image source={GitHubMark} style={{ width: 50, height: 50 }} />
    </TouchableOpacity>
  </View>
);

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TopSection />
      <View style={styles.contentContainer}>
        <ButtonSection navigation={navigation} />
      </View>
      <BottomSection />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonSpace: {
    width: 20,
  },
  bottomContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  blueText: {
    color: 'blue',
  },
});