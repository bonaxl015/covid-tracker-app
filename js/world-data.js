const CONFIRMED_URL = 'https://covid-api.mmediagroup.fr/v1/history?status=confirmed';
const DEATH_URL = 'https://covid-api.mmediagroup.fr/v1/history?status=deaths';
const RECOVERED_URL = 'https://covid-api.mmediagroup.fr/v1/history?status=recovered';
const CASES_URL = 'https://covid-api.mmediagroup.fr/v1/cases';
const ALL_DATA_URL = 'https://covid-19.dataflowkit.com/v1';

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

async function updateDashboard(){
    const totalCases = document.getElementsByClassName('total-number-container')[0];
    const activeCases = document.getElementsByClassName('infected-number-container')[0];
    const recoveredCount = document.getElementsByClassName('recovered-number-container')[0];
    const deathCases = document.getElementsByClassName('death-number-container')[0];
    let dashboardData = await fetchDashboardData();
    
    totalCases.innerText = dashboardData['Total Cases_text'];
    activeCases.innerText = dashboardData['Active Cases_text'];
    recoveredCount.innerText = dashboardData['Total Recovered_text'];
    deathCases.innerText = dashboardData['Total Deaths_text'];
}

async function fetchDashboardData(){
    let dashboardData;
    const response = await fetch(ALL_DATA_URL);
    const data = await response.json();

    for(let i = 0; i < data.length; i++){
        if(data[i].Country_text === 'World'){
            dashboardData = data[i];
        }
    }
    return dashboardData;
}

async function fetchChartData(url){
    let labelArray = [], dataArray = [];
    let allDataObject;

    const response = await fetch(url);
    const data = await response.json();
    
    for(let e in data){
        if(e === 'Global'){
            for(let x in data[e]['All']['dates']){
                labelArray.push(x);
                dataArray.push(data[e]['All']['dates'][x]);
            }
        }
    }
    allDataObject = new ChartData(labelArray, dataArray);
    return allDataObject;
}

async function displayChart(){
    let confirmed = await fetchChartData(CONFIRMED_URL);
    let death = await fetchChartData(DEATH_URL);
    let recovered = await fetchChartData(RECOVERED_URL);

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
                    text: 'Worldwide COVID-19 Cases',
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
    new Chart(myChart, config);
    loading();
}

async function fetchTableData(){
    let tableData = [];
    const response = await fetch('https://covid-api.mmediagroup.fr/v1/cases');
    const data = await response.json();
        
    for(let e in data){
        tableData.push(data[e]);
    }
    return tableData;
}

async function displayTableData(page = 1){
    const tableDisplay = document.getElementById('data');
    const download = document.getElementsByClassName('download')[0];
    let tableData = await fetchTableData();
    let temp = '';
    let max = page * 10;
    let min = max - 10;

    setPages(page, tableData.length);
    if(tableData){
        for(let i = min; i < max; i++){
            let data = tableData[i].All;
    
            if(data.country){
                temp +=
                    `<tr>
                        <td>${data.country}</td>
                        <td>${data.confirmed}</td>
                        <td>${data.deaths}</td>
                        <td>${data.recovered}</td>
                        <td>${data.population}</td>            
                    </tr>`;
            }
        }
    }else{
        temp = 
            `<tr>
                <td>No data available</td>
            </tr>`;
    }
    tableDisplay.innerHTML = temp;
    download.addEventListener('click', downloadCsvData);

}

async function setPages(i, tableData){
    let pageNumber = Math.ceil(tableData / 10);
    const pageButton = document.getElementById('pages');
    let temp = '';
 
    temp += `
        <button id="previous" onClick="previousPage(${i})">Previous</button>
        <button id="num-display">${i}</button>
        <button id="next" onClick="nextPage(${i}, ${pageNumber})">Next</button>
        `;
    pageButton.innerHTML = temp;
}

function previousPage(i){
    const download = document.getElementsByClassName('download')[0];
    const previousButton = document.getElementById('previous');
    const nextButton = document.getElementById('next');

    download.removeEventListener('click', downloadCsvData);
    nextButton.disabled = false;
    if(i != 1){
        previousButton.disabled = false;
        displayTableData(--i);
    }else{
        previousButton.disabled = true;
    }
}

function nextPage(i, pageNumber){
    const download = document.getElementsByClassName('download')[0];
    const previousButton = document.getElementById('previous');
    const nextButton = document.getElementById('next');

    download.removeEventListener('click', downloadCsvData);
    previousButton.disabled = false;
    if(i != pageNumber){
        nextButton.disabled = false;
        displayTableData(++i);
    }else{
        nextButton.disabled = true;
    }
}

async function downloadCsvData(){
    let tableData = await fetchTableData();

    processCsv(tableData);
}

function processCsv(json){
    data = [];

    for(let e in json){
        if(json[e].All.country){
            data.push(json[e].All);
        }
    }
    const csv = data.map(row => ({
        Country: row.country,
        Capital: row.capital_city,
        Confirmed: row.confirmed,
        Death: row.deaths,
        Recovered: row.recovered,
        Population: row.population
    }));
    
    let csvData = objectToCsv(csv);
    downloadCsv(csvData);
}

function objectToCsv(csv){
    const csvRows = [];
    const headers = Object.keys(csv[0]);

    csvRows.push(headers.join(','));
    for(let row of csv){
        let values = headers.map(header => {
            let escape = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escape}"`;
        })
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

function downloadCsv(csvData){
    const blob = new Blob([csvData], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'data-export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

clickMenu();
displayTableData();
updateDashboard();
displayChart();