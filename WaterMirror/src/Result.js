import React from 'react';
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Alert } from 'react-native';

// 畫面視窗
export default function HomeScreen() {
    return (
      <View style={styles.container}>
        <Text>查閱報表</Text>
      </View>
    );
  }

// 主樣式表
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});