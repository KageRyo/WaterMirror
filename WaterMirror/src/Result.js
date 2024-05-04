import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

// 結果頁面
export default function ResultScreen({ navigation, route }) {
    // 取得資料並檢查資料
    const { data } = route.params ?? {};
    if (data === undefined) {
        console.error("No data passed to ResultScreen.");
        return (
            <View style={styles.container}>
                <Text style={styles.error}>未接收到水質資料，請返回並重新嘗試。</Text>
                <Button title="回到主畫面" onPress={() => navigation.goBack()} />
            </View>
        );
    }
    const dataValue = typeof data === 'number' ? data : null;

    // 計算水質等級的函式
    const countWaterQuality = (wqi5) => {
        let rating = '';
        let comment = '';
        let color = styles.defaultColor;

        // 依據 WQI5 判斷水質等級
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

    const { rating, comment, color } = dataValue !== null ? countWaterQuality(dataValue) : { rating: '未知', comment: '無有效水質資料，請返回並重新輸入資料。', color: styles.defaultColor };

    // 顯示結果
    return (
        <View style={styles.container}>
            <Text style={styles.content}>{dataValue !== null ? `綜合評分：${dataValue}` : '請先至「輸入資料」頁面輸入您的水質資料'}</Text>
            <Text style={[styles.rating, color]}>{rating}</Text>
            <Text style={styles.comment}>{comment}</Text>
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
