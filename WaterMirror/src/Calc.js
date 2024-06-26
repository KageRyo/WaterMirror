       import React, { useState, useEffect } from 'react';
import { Alert, Button, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '@/config.json';

// 水質輸入元件
const Input = ({ label, value, onChangeText }) => (
  <TextInput
    style={styles.input}
    placeholder={label}
    keyboardType="numeric"
    value={value}
    onChangeText={onChangeText}
  />
);

// 連接狀態元件
const ConnectionStatus = ({ status }) => (
  <Text style={[styles.status, status === '已連線到MPR水質分析模型' ? styles.connected : styles.notConnected]}>
    連線狀況: {status}
  </Text>
);

// 用於檢查與伺服器的連線狀態的 Hook
const useServerConnection = (apiUrl) => {
  const [status, setStatus] = useState('與MPR水質分析伺服器連線中...');

  useEffect(() => {
    const checkTimeout = 5000;
    const intervalId = setInterval(() => checkConnection(), checkTimeout);
    return () => clearInterval(intervalId);
  }, []);

  // 檢查與伺服器的連線狀態
  const checkConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/`);
      const jsonResponse = await response.json();
      setStatus(jsonResponse.message === '成功與 API 連線!' ? '已連線到MPR水質分析模型' : '與MPR水質分析模型連線失敗');
    } catch (error) {
      console.error('連線錯誤:', error);
      setStatus('MPR水質分析伺服器未開啟');
    }
  };

  return status;
};

// 畫面視窗
export default function CalcScreen({ navigation }) {
  const apiUrl = `${config.api_url}:${config.port}`;
  const status = useServerConnection(apiUrl);
  const [data, setData] = useState({
    DO: '',
    BOD: '',
    NH3N: '',
    EC: '',
    SS: '',
  });
  const [assessment, setAssessment] = useState({
    DO: '',
    BOD: '',
    NH3N: '',
    EC: '',
    SS: '',
  });

  useEffect(() => {
    requestStoragePermission();
    loadStoredData();
  }, []);

  // 請求存儲權限
  async function requestStoragePermission() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('需要權限以訪問您的媒體庫！');
    }
  }

  // 載入暫存資料
  const loadStoredData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('waterQualityData');
      const storedAssessment = await AsyncStorage.getItem('waterQualityAssessment');
      if (storedData) {
        setData(JSON.parse(storedData));
      }
      if (storedAssessment) {
        setAssessment(JSON.parse(storedAssessment));
      }
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  };

  // 暫存資料
  const storeData = async (data, assessment) => {
    try {
      await AsyncStorage.setItem('waterQualityData', JSON.stringify(data));
      await AsyncStorage.setItem('waterQualityAssessment', JSON.stringify(assessment));
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  };

  // 處理上傳成功時的操作
  const handleUploadSuccess = (data) => {
    const { score, assessment } = data;
    const scoreString = JSON.stringify(score.toFixed(2), null, 2);

    Alert.alert(
      '分析完成',
      `您的水質資料已分析完成。\n綜合評分為：${scoreString}`,
      [
        { text: '取消', onPress: () => {} },
        {
          text: '查看報表',
          onPress: () => {
            storeData(score, assessment);
            navigation.navigate('Result', { data: score, assessment });
          },
        },
      ],
      { cancelable: false }
    );
  };

  // 處理上傳的CSV水質資料檔案
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.cancelled) {
        const pickedFile = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType
        });
        
        // 處理伺服器回應
        try {
          const response = await fetch(`${apiUrl}/score/total/`, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          const responseData = await response.json();
          if (response.ok) {
            handleUploadSuccess(responseData);
          } else {
            throw new Error('Network response was not ok');
          }
        } catch (error) {
          Alert.alert('上傳失敗', '發生錯誤，請稍後重試。', [{ text: '確定' }]);
        }
      };
    } catch (error) {
      console.error('Error during file upload:', error);
      Alert.alert('上傳失敗', `資料上傳至伺服器失敗。您可能未選取任何檔案，或是網路連線異常。`, [{ text: '確定' }]);
    }
  };

  // 處理手動輸入的水質資料
  const handleSubmit = async () => {
    const filledData = Object.values(data).filter(value => value !== '');
    if (filledData.length > 0) {
      const csvData = `DO,BOD,NH3N,EC,SS\n${Object.values(data).join(',')}`;
      const fileName = `${FileSystem.cacheDirectory}water_quality_data.csv`;
      await FileSystem.writeAsStringAsync(fileName, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const formData = new FormData();
      formData.append('file', {
        uri: fileName,
        name: 'water_quality_data.csv',
        type: 'text/csv',
      });

    // 上傳文件並處理伺服器回應
    try {
      const response = await fetch(`${apiUrl}/score/total/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const responseData = await response.json();
      if (response.ok) {
        handleUploadSuccess(responseData); // 這裡傳遞responseData
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      Alert.alert('上傳失敗', '發生錯誤，請稍後重試。', [{ text: '確定' }]);
    }
    } else {
      Alert.alert('提示', '請填寫水質資料', [{ text: '確定' }]);
    }
    storeData(data, assessment);
    clearInput();
  };

  // 清空輸入框
  const clearInput = () => {
    setData({ DO: '', BOD: '', NH3N: '', EC: '', SS: '' });
  };

  // 顯示警語
  const showWarningAlert = () => {
    Alert.alert(
      "免責聲明",
      "人工智慧分析系統如WaterMirror在處理水質資料時仍可能會出現錯誤。分析結果可能受到水質資料品質、測量方法或環境因素的影響而產生偏差。使用前請謹慎評估，並應與專業意見或實驗結果相結合，以確保決策的準確性。本軟體提供的分析結果僅供參考，開發者不承擔因依賴這些資訊而導致的任何直接或間接損失。",
      [{ text: "我知道了" }]
    );
  };

  // 關閉鍵盤
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <ConnectionStatus status={status} />
        </View>

        <View style={styles.separator} />

        <View style={styles.inputContainer}>
          <Text style={styles.title}>手動輸入水質資料</Text>
          <Input label="溶氧量（DO, %）" value={data.DO} onChangeText={(text) => setData({ ...data, DO: text })} />
          <Input label="生物需氧量（BOD, mg/L）" value={data.BOD} onChangeText={(text) => setData({ ...data, BOD: text })} />
          <Input label="氨氮（NH3-N, mg/L）" value={data.NH3N} onChangeText={(text) => setData({ ...data, NH3N: text })} />
          <Input label="導電度（EC, μumho/co）" value={data.EC} onChangeText={(text) => setData({ ...data, EC: text })} />
          <Input label="懸浮固體（SS, mg/L）" value={data.SS} onChangeText={(text) => setData({ ...data, SS: text })} />
        </View>

        <View style={styles.dataContainer}>
        <Text style={styles.sectionTitle}>目前輸入的水質資料</Text>
        {Object.values(data).every(value => value) ? (
          <Text>
            DO: {data.DO}% BOD: {data.BOD}mg/L NH3-N: {data.NH3N}mg/L EC: {data.EC}μumho/co SS: {data.SS}mg/L
          </Text>
          ) : (
            <Text>請在上方輸入框輸入水質資料或上傳CSV檔案</Text>
          )}
        </View>

        <View style={styles.btnContainer}>
          <Button title="刪除" onPress={clearInput} />
          <Button title="送出" onPress={handleSubmit} />
        </View>

        <View style={styles.separator} />

        <View style={styles.btnContainer}>
          <Button title="上傳水質資料檔案" onPress={handleFileUpload} />
        </View>

        <View style={styles.warningContainer}>
          <TouchableOpacity onPress={showWarningAlert}>
            <Text style={styles.warningText}>
              WaterMirror 仍可能會出現錯誤，請謹慎使用。
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
  },
  connectionStatus: {
    fontSize: 16,
    padding: 5,
  },
  connected: {
    color: 'green',
  },
  notConnected: {
    color: 'red',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  dataContainer: {
    width: '80%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  separator: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    width: '80%',
    marginVertical: 10,
  },
  warningContainer: {
    width: '80%',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: 'red',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});