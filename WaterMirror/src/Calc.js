import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Button, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

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
const ConnectionStatus = ({ status }) => {
  const { t } = useTranslation();
  return (
    <Text style={[styles.status, status === t('calc.connection.connected') ? styles.connected : styles.notConnected]}>
      {t('calc.connection.status')} {status}
    </Text>
  );
};

// 用於檢查與伺服器的連線狀態的 Hook
const useServerConnection = (apiUrl) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(t('calc.connection.connecting'));

  useEffect(() => {
    const checkTimeout = 5000;
    const intervalId = setInterval(() => checkConnection(), checkTimeout);
    return () => clearInterval(intervalId);
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/`);
      const jsonResponse = await response.json();
      setStatus(jsonResponse.message === '成功與 API 連線!' ? 
        t('calc.connection.connected') : t('calc.connection.failed'));
    } catch (error) {
      console.error('連線錯誤:', error);
      setStatus(t('calc.connection.disconnected'));
    }
  };

  return status;
};

// 畫面視窗
export default function CalcScreen({ navigation }) {
  const { t } = useTranslation();
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
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    requestStoragePermission();
    loadStoredData();
  }, []);

  // 請求存儲權限
  async function requestStoragePermission() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('alerts.notice'), t('alerts.storagePermission'));
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
      t('calc.upload.success'),
      t('calc.upload.scoreMessage', { score: scoreString }),
      [
        { text: t('calc.buttons.cancel'), onPress: () => {} },
        {
          text: t('calc.buttons.viewReport'),
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
  const handleFileUpload = useCallback(async () => {
    if (isUploading) return; // 如果正在上傳中，直接返回

    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({ 
        type: '*/*',
        copyToCacheDirectory: true // 確保檔案被複製到快取目錄
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType
        });
        
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
          Alert.alert(
            t('calc.upload.failed'),
            t('calc.upload.retryMessage'),
            [{ text: t('calc.buttons.confirm') }]
          );
        }
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      Alert.alert(
        t('calc.upload.failed'),
        t('calc.upload.errorMessage'),
        [{ text: t('calc.buttons.confirm') }]
      );
    } finally {
      setIsUploading(false); // 無論成功與否，都將上傳狀態設為 false
    }
  }, [apiUrl, isUploading, t]); // 加入相依性陣列

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
      Alert.alert(
        t('alerts.notice'), 
        t('calc.validation.pleaseInputData'), 
        [{ text: t('calc.buttons.confirm') }]
      );
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
      t('alerts.notice'),
      t('alerts.disclaimer'),
      [{ text: t('alerts.iUnderstand') }]
    );
  };

  // 關閉鍵盤
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('calc.title')}</Text>
        
        {/* 連線狀況 */}
        <ConnectionStatus status={status} />
        
        <View style={styles.separator} />
        
        {/* 手動輸入水質資料 */}
        <View style={styles.dataContainer}>
          <Input 
            label={t('calc.parameters.DO')} 
            value={data.DO} 
            onChangeText={(text) => setData({ ...data, DO: text })} 
          />
          <Input 
            label={t('calc.parameters.BOD')} 
            value={data.BOD} 
            onChangeText={(text) => setData({ ...data, BOD: text })} 
          />
          <Input 
            label={t('calc.parameters.NH3N')} 
            value={data.NH3N} 
            onChangeText={(text) => setData({ ...data, NH3N: text })} 
          />
          <Input 
            label={t('calc.parameters.EC')} 
            value={data.EC} 
            onChangeText={(text) => setData({ ...data, EC: text })} 
          />
          <Input 
            label={t('calc.parameters.SS')} 
            value={data.SS} 
            onChangeText={(text) => setData({ ...data, SS: text })} 
          />
        </View>
    
        <View style={styles.btnContainer}>
          <Button title={t('calc.buttons.clear')} onPress={clearInput} />
          <Button title={t('calc.buttons.submit')} onPress={handleSubmit} />
        </View>

        <View style={styles.dataDisplayContainer}>
          <Text style={styles.dataDisplayTitle}>{t('calc.dataDisplay.title')}</Text>
          {Object.values(data).some(value => value !== '') ? (
            <View style={styles.dataDisplayContent}>
              {Object.entries(data).map(([key, value]) => (
                value && (
                  <Text key={key} style={styles.dataDisplayText}>
                    {t(`calc.parameters.${key}`)}: {value}
                  </Text>
                )
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>{t('calc.dataDisplay.noData')}</Text>
          )}
        </View>

        <View style={styles.separator} />

        {/* 上傳水質資料檔案 */}
        <View style={styles.btnContainer}>
          <Button 
            title={t('calc.buttons.uploadFile')} 
            onPress={handleFileUpload}
            disabled={isUploading} // 在上傳過程中禁用按鈕
          />
        </View>

        {/* 警告訊息 */}
        <View style={styles.warningContainer}>
          <TouchableOpacity onPress={showWarningAlert}>
            <Text style={styles.warningText}>
              {t('calc.warning.message')}
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
    fontSize: 24,
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
    fontSize: 24,
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
  dataDisplayContainer: {
    width: '80%',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  dataDisplayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  dataDisplayContent: {
    marginTop: 5,
  },
  dataDisplayText: {
    fontSize: 14,
    marginVertical: 2,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
});
