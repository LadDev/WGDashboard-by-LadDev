import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import getChartColorsArray from "../../Components/Common/ChartsDynamicColor";
import ReactApexChart from "react-apexcharts";
import {Card, CardBody, CardHeader, Col} from "reactstrap";

const TraficChart = (props) => {
    const [metricType, setMetricType] = useState("MB")

    const convertUnixTimestampToISODate = (unixTimestamp) => {
        const currentDate = new Date();
        const targetDate = new Date(unixTimestamp);

        if (
            currentDate.getDate() === targetDate.getDate() &&
            currentDate.getMonth() === targetDate.getMonth() &&
            currentDate.getFullYear() === targetDate.getFullYear()
        ) {
            // Если дата сегодняшняя, то выводим только время
            const hours = targetDate.getHours().toString().padStart(2, '0');
            const minutes = targetDate.getMinutes().toString().padStart(2, '0');
            const seconds = targetDate.getSeconds().toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        } else {
            // Иначе выводим дату и время
            const day = targetDate.getDate().toString().padStart(2, '0');
            const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
            const year = targetDate.getFullYear().toString();
            const hours = targetDate.getHours().toString().padStart(2, '0');
            const minutes = targetDate.getMinutes().toString().padStart(2, '0');
            const seconds = targetDate.getSeconds().toString().padStart(2, '0');
            return `${day}:${month}:${year} ${hours}:${minutes}:${seconds}`;
        }
    }

    // const {chartDataRes} = useSelector(state => ({
    //     chartDataRes: state.Config.chartData
    // }))

    const [chartData, setChartData] = useState(null)

    const changeChartData = () => {
        let metric = (1024**3);
        let tf = 2

        if(metricType === "KB"){
            metric = (1024**1);
            tf=2
        }else if(metricType === "MB"){
            metric = (1024**2);
            tf=2
        }else if(metricType === "GB"){
            metric = (1024**3);
            tf = 4
        }

        const sent = []
        const receive = []
        const time = []

        for(const sentRes of props.chartDataRes.sent){
            sent.push(Number(Number(sentRes/metric).toFixed(tf)))
        }

        for(const receiveRes of props.chartDataRes.receive){
            receive.push(Number(Number(receiveRes/metric).toFixed(tf)))
        }

        for(const timeRes of props.chartDataRes.time){
            time.push(`${convertUnixTimestampToISODate(Number(timeRes))}`)
        }

        setChartData({sent,receive,time})
    }

    useEffect(()=>{
        if(props.chartDataRes !== chartData){
            changeChartData()
        }
    },[props.chartDataRes, metricType])


    const [series, setSeries] = useState(null)
    const [options, setOptions] = useState(null)


    useEffect(()=>{
        if(chartData){
            setOptions({
                chart: {
                    height: 300, type: 'area',
                    toolbar: {show: true, selection: false},
                    zoom: {enabled: false},
                },
                dataLabels: {enabled: false},
                stroke: {curve: 'smooth'},
                colors: areachartSplineColors,
                xaxis: {type: 'datetime', categories: chartData?chartData.time:[]},
                tooltip: {
                    x: {format: 'dd/MM/yy HH:mm'},
                    y: {format: 'dd/MM/yy HH:mm'},
                },
            })
            setSeries(
                [{name: props.t('Data Received')+` (${metricType})`, data: chartData?chartData.receive:[]},
                    {name: props.t('Data Sent')+` (${metricType})`, data: chartData?chartData.sent:[]}]
            )
        }else{
            setOptions({})
            setSeries([])
        }
    },[chartData])


    let areachartSplineColors = getChartColorsArray(props.dataColors);

    const changeMetricType = (type) => {
        setMetricType(type)
    }

    return (
        <React.Fragment>
            {chartData && chartData && series?(
                <Col>

                    <Card>
                        <CardHeader className="border-0 align-items-center d-flex">
                            <h4 className="card-title mb-0 flex-grow-1">{props.t("Data Usage")}</h4>
                            <div className="d-flex gap-1">
                                <div className="btn-group" role="group">
                                    <button className={metricType==="GB"?"btn btn-outline-info btn-sm switchUnit active":"btn btn-outline-info btn-sm switchUnit"} onClick={()=>{changeMetricType("GB")}} >GB</button>
                                    <button className={metricType==="MB"?"btn btn-outline-info btn-sm switchUnit active":"btn btn-outline-info btn-sm switchUnit"} onClick={()=>{changeMetricType("MB")}} >MB</button>
                                    <button className={metricType==="KB"?"btn btn-outline-info btn-sm switchUnit active":"btn btn-outline-info btn-sm switchUnit"} onClick={()=>{changeMetricType("KB")}} >KB</button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <ReactApexChart dir="ltr" options={options} series={series} type="area" height="300" className="apex-charts" />
                        </CardBody>
                    </Card>
                </Col>
            ):("")}

        </React.Fragment>
    );
}

TraficChart.propTypes = {
    t: PropTypes.any,
    dataColors: PropTypes.string,
    confName: PropTypes.string,
    chartDataRes: PropTypes.object
};

export default withTranslation()(TraficChart);
