import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import config from './config.json';

export default function ResultScreen({ navigation, route }) {
    const { data } = route.params ?? {};
    const [percentile, setPercentile] = useState(null);

    useEffect(() => {
        if (typeof data === 'number') {
            fetch(`${config.api_url}:${config.port}/percentile?score=${data}`)
                .then(response => response.json())
                .then(data => {
                    if (data.percentile !== undefined) {
                        setPercentile(data.percentile);
                    } else {
                        throw new Error('無法獲取百分位數');
                    }
                })
                .catch(error => {
                    console.error('Error fetching percentile data:', error);
                    Alert.alert('錯誤', '無法從伺服器獲取百分位數。');
                });
        }
    }, [data]);

    if (data === undefined) {
        console.error("No data passed to ResultScreen.");
        return (
            <View style={styles.container}>
                <Text style={styles.error}>未接收到水質資料，請返回並重新嘗試。</Text>
                <Button title="回到主畫面" onPress={() => navigation.goBack()} />
            </View>
        );
    }

    const countWaterQuality = (wqi5) => {
        let rating = '';
        let comment = '';
        let color = styles.defaultColor;

        if (wqi5 > 100) {
            rating = '輸入的資料可能有誤';
            comment = '請檢查並重新輸入正確的資料。';
            color = styles.red;
        } else if (wqi5 > 85) {
            rating = '優良';
            comment = '您的水質狀況優良，可做各種用途，加氯消毒可直接飲用。';
            color = styles.green;
        } else if (wqi5 > 70) {
            rating = '良好';
            comment = '您的水質狀況良好，可做為自來水水源、水產、工業、遊樂及灌溉用途。';
            color = styles.green;
        } else if (wqi5 > 50) {
            rating = '中等';
            comment = '您的水質狀況尚可，可做為自來水水源，但需經特別處理，可養殖粗魚，可供工業，遊憩及灌溉用水。';
            color = styles.gold;
        } else if (wqi5 > 30) {
            rating = '不良';
            comment = '您的水質狀況屬於中下等，僅適合做灌溉或工業冷卻。';
            color = styles.gold;
        } else if (wqi5 > 15) {
            rating = '糟糕';
            comment = '您的水質狀況不佳，但仍不會引起厭惡，可作環境保育之用。';
            color = styles.red;
        } else if (wqi5 > 0) {
            rating = '惡劣';
            comment = '您的水質狀況惡劣，可能發生臭味。';
            color = styles.red;
        } else {
            rating = '無效數值';
            comment = '此數值無法進行分析，請檢查後再試。';
            color = styles.red;
        }

        return { rating, comment, color };
    };

    const { rating, comment, color } = data !== null ? countWaterQuality(data) : { rating: '未知', comment: '無有效水質資料，請返回並重新輸入資料。', color: styles.defaultColor };

    return (
        <View style={styles.container}>
            <Text style={styles.content}>{data !== null ? `綜合評分：${data}` : '請先至「輸入資料」頁面輸入您的水質資料'}</Text>
            <Text style={[styles.rating, { color }]}>{rating}</Text>
            <Text style={styles.comment}>{comment}</Text>
            {percentile !== null && (
                <Text style={styles.percentile}>您的水質狀況優於了 {percentile.toFixed(2)}% 的水質資料！</Text>
            )}
            <Button title="重新輸入資料" onPress={() => navigation.navigate('Calc')} />
        </View>
    );
}

// 主樣式表
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        fontSize: 18,
        marginBottom: 10,
    },
    rating: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    comment: {
        fontSize: 16,
        marginBottom: 20,
        color: 'black',
    },
    percentile: {
        fontSize: 16,
        color: 'blue',
        marginBottom: 10,
    },
    error: {
        color: 'red',
        fontSize: 18,
    },
    green: {
        color: 'green',
    },
    gold: {
        color: '#FFD700',
    },
    red: {
        color: 'red',
    },
    defaultColor: {
        color: 'black',
    }
});
