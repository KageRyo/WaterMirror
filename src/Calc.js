import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Button, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import config from '@/config';
import { apiClient } from '@/utils/apiClient';

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
const useServerConnection = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(t('calc.connection.connecting'));

  const checkConnection = async () => {
    try {
      const response = await apiClient.health();
      const jsonResponse = await response.json();
      setStatus(jsonResponse.status === 'ok' ?
        t('calc.connection.connected') : t('calc.connection.failed'));
    } catch (error) {
      console.error('連線錯誤:', error);
      setStatus(t('calc.connection.disconnected'));
    }
  };

  useEffect(() => {
    checkConnection();
    const intervalId = setInterval(checkConnection, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return status;
};

// 畫面視窗
export default function CalcScreen({ navigation }) {
  const { t } = useTranslation();
  const status = useServerConnection();
  const [data, setData] = useState({
    DO: '',
    BOD: '',
    NH3N: '',
    EC: '',
    SS: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModelType, setSelectedModelType] = useState(config.defaultModelType);

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
      const storedInputs = await AsyncStorage.getItem('waterQualityInputs');
      if (storedInputs) {
        setData(JSON.parse(storedInputs));
      }
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  };

  // 暫存資料
  const storeData = async (inputs, result) => {
    try {
      await AsyncStorage.setItem('waterQualityInputs', JSON.stringify(inputs));
      await AsyncStorage.setItem('waterQualityResult', JSON.stringify(result));
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  };

  // 處理上傳成功時的操作
  const handleUploadSuccess = (result) => {
    const { score, category } = result;
    const scoreString = JSON.stringify(score.toFixed(2), null, 2);

    Alert.alert(
      t('calc.upload.success'),
      t('calc.upload.scoreMessage', { score: `${scoreString} (${category || t('result.unknownStatus')})` }),
      [
        { text: t('calc.buttons.cancel'), onPress: () => {} },
        {
          text: t('calc.buttons.viewReport'),
          onPress: () => {
            storeData(data, result);
            navigation.navigate('Result', { result });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const parseErrorMessage = async (response) => {
    try {
      const payload = await response.json();
      return payload.detail || t('calc.upload.retryMessage');
    } catch {
      return t('calc.upload.retryMessage');
    }
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
        formData.append('model_type', selectedModelType);
        
        try {
          const response = await apiClient.assessCsvSummary(formData);
          if (response.ok) {
            const responseData = await response.json();
            handleUploadSuccess(responseData);
          } else {
            throw new Error(await parseErrorMessage(response));
          }
        } catch (error) {
          Alert.alert(
            t('calc.upload.failed'),
            error.message || t('calc.upload.retryMessage'),
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
    if (isSubmitting) return;

    const emptyFields = Object.entries(data).filter(([, value]) => value === '');
    if (emptyFields.length > 0) {
      Alert.alert(
        t('alerts.notice'), 
        t('calc.validation.pleaseInputAllData', { fields: emptyFields.map(([key]) => t(`calc.parameters.${key}`)).join(', ') }),
        [{ text: t('calc.buttons.confirm') }]
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.assess({
        DO: Number(data.DO),
        BOD: Number(data.BOD),
        NH3N: Number(data.NH3N),
        EC: Number(data.EC),
        SS: Number(data.SS),
        model_type: selectedModelType,
      });
      if (response.ok) {
        const responseData = await response.json();
        handleUploadSuccess(responseData);
      } else {
        throw new Error(await parseErrorMessage(response));
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        t('calc.upload.failed'),
        error.message || t('calc.upload.retryMessage'),
        [{ text: t('calc.buttons.confirm') }]
      );
    } finally {
      setIsSubmitting(false);
    }
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

        {/* 模型選擇 */}
        <View style={styles.modelSelectorContainer}>
          <Text style={styles.modelSelectorLabel}>{t('calc.modelSelection.label')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedModelType}
              onValueChange={(itemValue) => setSelectedModelType(itemValue)}
              style={styles.picker}
            >
              {config.supportedModelTypes.map((model) => (
                <Picker.Item key={model} label={model} value={model} />
              ))}
            </Picker>
          </View>
          <Text style={styles.modelSelectorHint}>
            {t('calc.modelSelection.hint')}
          </Text>
        </View>
    
        <View style={styles.btnContainer}>
          <Button title={t('calc.buttons.clear')} onPress={clearInput} />
          <Button title={isSubmitting ? t('calc.connection.connecting') : t('calc.buttons.submit')} onPress={handleSubmit} disabled={isSubmitting} />
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
            title={isUploading ? t('calc.connection.connecting') : t('calc.buttons.uploadFile')}
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
  modelSelectorContainer: {
    width: '80%',
    marginBottom: 15,
  },
  modelSelectorLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  modelSelectorHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
