const CONFIRMED_URL = 'https://covid-api.mmediagroup.fr/v1/history?status=confirmed';
const DEATH_URL = 'https://covid-api.mmediagroup.fr/v1/history?status=deaths';
const RECOVERED_URL = 'https://covid-api.mmediagroup.fr/v1/history?status=recovered';
const CASES_URL = 'https://covid-api.mmediagroup.fr/v1/cases';
const VACCINE_URL = 'https://covid-api.mmediagroup.fr/v1/vaccines';


class ChartData{
    constructor(label, data){
        this.label = label;
        this.data = data;
    }
}

function loading(){
    const loader = document.querySelector('.loader');

    loader.classList.add('hidden');
}

function clickMenu(){
    const menu = document.querySelector('.hamburger');
    const listMenu = document.querySelector('.mobile-nav');

    menu.addEventListener('click', () => {
        listMenu.classList.toggle('is-active');
    })
}

function searchCountryData(){
    const inputCountry = document.getElementById('search');
    
    console.log(inputCountry.value);
    updateDashboard(inputCountry.value);
    displayChart(inputCountry.value);
}


async function updateDashboard(country = 'Philippines'){
    const infectedCount = document.getElementsByClassName('infected-number-container')[0];
    const recoveredCount = document.getElementsByClassName('recovered-number-container')[0];
    const deathCount = document.getElementsByClassName('death-number-container')[0];
    const vaccinatedCount = document.getElementsByClassName('vaccine-number-container')[0];
    let infectRecoverAndDeathData = await fetchDashboardData(CASES_URL, country);
    let vaccineData = await fetchDashboardData(VACCINE_URL, country);

    infectedCount.innerText = numberWithCommas(infectRecoverAndDeathData.confirmed);
    recoveredCount.innerText = numberWithCommas(infectRecoverAndDeathData.recovered);
    deathCount.innerText = numberWithCommas(infectRecoverAndDeathData.deaths);
    vaccinatedCount.innerText = numberWithCommas(vaccineData.people_vaccinated);
}

async function fetchDashboardData(url, country){
    let dashboardData;
    const response = await fetch(url);
    const data = await response.json();

    for(let e in data){
        if(e === country || e.toLowerCase() === country.toLowerCase()){
            dashboardData = data[e].All;
        }
    }
    return dashboardData;
}

async function fetchChartData(url, country){
    let labelArray = [], dataArray = [];
    let allDataObject;

    const response = await fetch(url);
    const data = await response.json();
    
    for(let e in data){
        if(e === country || e.toLowerCase() === country.toLowerCase()){
            for(let x in data[e]['All']['dates']){
                labelArray.push(x);
                dataArray.push(data[e]['All']['dates'][x]);
            }
        }
    }
    allDataObject = new ChartData(labelArray, dataArray);
    return allDataObject;
}

async function displayChart(country = 'Philippines'){
    const inputCountry = document.getElementById('search');
    const displayCountry = document.getElementsByClassName('country-display')[0];
    let newChart;
    let confirmed = await fetchChartData(CONFIRMED_URL, country);
    let death = await fetchChartData(DEATH_URL, country);
    let recovered = await fetchChartData(RECOVERED_URL, country);
    let myChart = document.getElementById('chart').getContext('2d');
    let config = {
        type: 'line',
        data: {
            labels: confirmed.label.reverse(),
            datasets: [
                {
                    label: 'Confirmed',
                    data: confirmed.data.reverse(),
                    backgroundColor: '#246EB9'
                },
                {
                    label: 'Recovered',
                    data: recovered.data.reverse(),
                    backgroundColor: '#63C328'
                },
                {
                    label: 'Death',
                    data: death.data.reverse(),
                    backgroundColor: '#EB4647'
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${capitalizeFirstLetter(country)} COVID-19 Cases`,
                    color: '#FFF',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    labels: {
                        color: '#FFF'
                    }
                }
            },
            scales: {
                xAxis: {
                    ticks: {
                        color: '#FFF'
                    },
                    grid: {
                        display: false
                    }
                },
                yAxis: {
                    ticks: {
                        color: '#FFF'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    };
    displayCountry.innerText  = capitalizeFirstLetter(country);
    newChart = new Chart(myChart, config);
    inputCountry.addEventListener('keydown', processInputCountry);
    loading();

    function processInputCountry(e){
        if(e.type === 'keydown'){
            if(e.which == 13 || e.keyCode == 13){
                newChart.destroy();
                searchCountryData();
                inputCountry.removeEventListener('keydown', processInputCountry);
            }
        }
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


clickMenu();
updateDashboard();
displayChart();