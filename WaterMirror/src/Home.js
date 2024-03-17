import React from 'react';
import { View, Button, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GitHubMark from '../assets/github-mark.png';

export default function HomeScreen() {
  const navigation = useNavigation();

  // 定義導航到GitHub頁面的函數
  const navigateToGitHub = () => {
    Linking.openURL('https://github.com/RotatingPotato/WaterMirror');
  };

  return (
    <View style={styles.container}>
      <Button title="進入水質資料填寫" onPress={() => navigation.navigate('Calc')} />
      {/* 底部容器 */}
      <View style={styles.bottomContainer}>
        <Text style={styles.blueText}>本專案由國立臺中科技大學智慧生產工程系</Text>
        <Text style={[styles.blueText, { marginBottom: 10 }]}>張健勳, 吳國維 進行開發</Text>
        <Text style={{ marginBottom: 10 }}>若有任何問題，歡迎到本專案GitHub頁面！</Text>
        <TouchableOpacity onPress={navigateToGitHub}>
          <Image
            source={GitHubMark}
            style={{ width: 50, height: 50 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 20,
  },
  blueText: {
    color: 'blue',
  },
});
