import React from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
    plugins,
    scales,
} from 'chart.js'
import { getLast7Days } from '../../lib/features';

ChartJS.register(
    Tooltip,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Filler,
    ArcElement,
    Legend
);

const lineChatOptions = {
    responsive:true,
    plugins:{
        legend:{
            display:false,
        },
        title:{
            display:false
        }
    },
    scales:{
        x:{
            grid:{
                display:false,
            }
        },
        y:{
            grid:{
                display:false
            }
        }
    }
}

const labels = getLast7Days()

const LineChart = ({value=[]}) => {
    const data = {
        labels: labels,
        datasets: [{
            data:value,
            label:"Messages",
            fill:true,
            backgroundColor:["rgba(75,192,192,0.2)"],
            borderColor:"rgba(75,192,192,1)"
        }]
    }
    return (
        <Line data={data} options={lineChatOptions}/>
    )
}

const doughnutChartOptions = {
    responsive:true,
    plugins:{
        legend:{
            display:false
        },
    },
    cutout:80
}

const DoughnutChart = ({value=[],labels=[]}) => {

    const data = {
        labels: labels,
        datasets: [{
            data:value,
            fill:false,
            backgroundColor:["rgba(75,192,192,0.2)","orange"],
            borderColor:["rgba(75,192,192,1)","orange"],
            offset:20
        }]
    }

    return (
        <Doughnut style={{zIndex:10}} data={data} options={doughnutChartOptions}/>
    )
}
export { LineChart, DoughnutChart }