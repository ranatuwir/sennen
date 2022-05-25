import axios from 'axios';

interface minSunrisePoint {
        lat: number,
        long: number,
        sunrise: any,
        sunset: any,
        dayLength?: string

  }

const getRandom = (x: number) => {
    return (Math.random() * (x + x) - x).toFixed(5)
}

let coordinates = {}
const coordinatesArr = Array.from(
        { length: 100 }, () => coordinates = { lat: getRandom(90), long: getRandom(180) }
    )

const fetchData = async (lat: number, long: number) => {
    try {
        let res = await axios(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${long}&formatted=0`)

        if (res.data.status === 'OK') {
            let {sunrise, sunset} = await res.data.results
            return {lat, long, sunrise, sunset}
        }
        else console.log(res.data.status)
    } catch (err) {
        console.error(err)
    }
}

const getDataArr = async () => {
    let dataArr: ({ lat: number; long: number; sunrise: any; sunset: any; })[] = []
    for (let i = 0; i <= 100; i+=5) {
        const chunk = [...coordinatesArr.slice(i,(i+5))]
        await Promise.all(chunk.map(async (x: any) => {
                const res = await fetchData(x.lat, x.long)
                if (res !== undefined) {
                    dataArr.push(res)
                }
        }))
    }
    return dataArr
} 

const getEarliestSunriseData = async () => {
    const dataArr = await getDataArr()

    const minSunrisePoint: minSunrisePoint = dataArr
        .filter(dataPoint => Date.parse(dataPoint.sunrise) > 1000)
        .reduce((a, b) => {
            return (Date.parse(a.sunrise) < Date.parse(b.sunrise)) ? a : b
        })
    
    const dayLength = ((Date.parse(minSunrisePoint.sunset) - Date.parse(minSunrisePoint.sunrise)) / (1000 * 3600)).toFixed(2)

    minSunrisePoint.dayLength = dayLength
    console.log(minSunrisePoint)
    return { minSunrisePoint }
}

getEarliestSunriseData()