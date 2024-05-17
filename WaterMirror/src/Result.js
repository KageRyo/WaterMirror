import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Dimensions, Button } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import config from './config.json';

// 結果畫面
export default function ResultScreen({ navigation, route }) {
    // 從 Route 中取得資料
    const { data } = route.params ?? {};
    // 百分位數狀態
    const [percentile, setPercentile] = useState(null);
    // 分類資料狀態
    const [categoryData, setCategoryData] = useState([]);
    // 綜合評分狀態
    const [score, setScore] = useState(null);
    // 類別狀態
    const [category, setCategory] = useState('');

    // 圖表設定
    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
    };

    // 獲取百分位數和相關類別資料
    useEffect(() => {
        if (typeof data === 'number') {
            setScore(data.toFixed(2)); // 修正綜合評分顯示至小數點後兩位
            fetch(`${config.api_url}:${config.port}/percentile?score=${data}`)
                .then(response => response.json())
                .then(data => {
                    if (data.percentile !== undefined) {
                        setPercentile(data.percentile);
                        fetchCategories();
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

    // 獲取類別資料
    const fetchCategories = () => {
        fetch(`${config.api_url}:${config.port}/categories/`)
            .then(response => response.json())
            .then(data => {
                const categories = data.data.map(item => ({
                    name: item.category,
                    population: item.rating,
                    color: getColor(item.category),
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 15
                }));
                setCategoryData(categories);
                determineCategory(data.data);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                Alert.alert('錯誤', '無法從伺服器獲取類別數據。');
            });
    };

    // 根據類別獲取顏色
    const getColor = (category) => {
        const colors = {
            '優良': 'green',
            '良好': 'blue',
            '中等': '#FFD700',
            '不良': 'orange',
            '糟糕': 'red',
            '惡劣': 'darkred'
        };
        return colors[category] || '#ccc';
    };

    // 計算水質狀態
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
            rating = '異常';
            comment = '您所輸入的水質資料可能有誤，也有可能是您尚未至「輸入資料」頁面輸入水質資料，請檢查並重新輸入資料。';
            color = styles.red;
        }

        return { rating, comment, color };
    };

    // 確定類別
    const determineCategory = (categories) => {
        const category = categories.find(category => category.rating >= data);
        setCategory(category ? category.category : '未知');
    };

    // 獲取經 WQI5 評估後的水質狀態資訊
    const { rating, comment, color } = data !== null ? countWaterQuality(data) : { rating: '未知', comment: '無有效水質資料，請返回並重新輸入資料。', color: styles.defaultColor };

    // 顯示警語
    const showWarningAlert = () => {
        Alert.alert(
            "免責聲明",
            "人工智慧分析系統如WaterMirror在處理水質資料時仍可能會出現錯誤。分析結果可能受到水質資料品質、測量方法或環境因素的影響而產生偏差。使用前請謹慎評估，並應與專業意見或實驗結果相結合，以確保決策的準確性。本軟體提供的分析結果僅供參考，開發者不承擔因依賴這些資訊而導致的任何直接或間接損失。",
            [{ text: "我知道了" }]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.score}>{score !== null ? `綜合評分：${score}` : '請先至「輸入資料」頁面輸入您的水質資料'}</Text>
                <Text style={[styles.rating, { color: color.color }]}>{rating}</Text>
            </View>

            <Text style={styles.comment}>{comment}</Text>

            {percentile !== null && (
                <View style={styles.chartContainer}>
                    <BarChart
                        data={{
                            labels: ["仍有的水質改善空間", "您贏過的水質資料"],
                            datasets: [{
                                data: [(100 - percentile).toFixed(2), (percentile).toFixed(2)],
                                colors: [(opacity = 1) => `pink`, (opacity = 1) => `lightgreen`]
                            }]
                        }}
                        width={Dimensions.get('window').width - 30}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="%"
                        chartConfig={{
                            ...chartConfig,
                            decimalPlaces: 0,
                        }}
                        verticalLabelRotation={0}
                        fromZero={true}
                        withCustomBarColorFromData={true}
                        showBarTops={true}
                        showValuesOnTopOfBars={true}
                        formatYLabel={(yValue) => `${yValue}%`}
                        style={styles.barChart}
                    />
                    <Text style={styles.percentile}>您的水質狀況優於了 {percentile.toFixed(2)}% 的水質資料！</Text>
                    <PieChart
                        data={categoryData}
                        width={Dimensions.get('window').width - 16}
                        height={220}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                        style={styles.pieChart}
                    />
                    <Text style={styles.percentileNote}>
                        <Text>您的水質資料目前位於 </Text>
                        <Text style={{ color: color.color }}>⬤</Text>
                        <Text> 區，狀態為</Text>
                        <Text style={[styles.rating, { color: color.color }]}>{rating}</Text>
                        <Text>。</Text>
                    </Text>
                </View>
            )}

            <Button title="重新輸入資料" onPress={() => navigation.navigate('Calc')} />

            <View style={styles.warningContainer}>
                <TouchableOpacity onPress={showWarningAlert}>
                    <Text style={styles.warningText}>
                        WaterMirror 仍可能會出現錯誤，請謹慎使用。
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    score: {
        fontSize: 18,
        marginRight: 10,
    },
    rating: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    comment: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    chartContainer: {
        marginBottom: 10,
        alignItems: 'center',
    },
    barChart: {
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
    },
    percentile: {
        fontSize: 16,
        color: 'blue',
        textAlign: 'center',
        marginBottom: 10,
    },
    pieChart: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    percentileNote: {
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        marginTop: 10,
    },
    warningContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    warningText: {
        fontSize: 14,
        color: 'red',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    error: {
        color: 'red',
        fontSize: 18,
    },
    green: {
        color: 'green',
    },
    gold: {
        color: '#D4AF37',
    },
    red: {
        color: 'red',
    },
    defaultColor: {
        color: 'black',
    },
});