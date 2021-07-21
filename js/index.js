const CASES_URL = 'https://covid-api.mmediagroup.fr/v1/cases';
const VACCINE_URL = 'https://covid-api.mmediagroup.fr/v1/vaccines';

clickMenu();
updateInfo();


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

async function updateInfo(){
    const secOneText = document.getElementById('s1-info-text');
    const secTwoText = document.getElementById('s2-info-text');
    const secThreeText = document.getElementById('s3-info-text');
    const secThreePText = document.getElementById('s3-1-info-text');
    const secFourText = document.getElementById('s4-info-text');
    const secFourP1Text = document.getElementById('s4-1-info-text');
    const secFourP2Text = document.getElementById('s4-2-info-text');
    let worldData = await fetchDashboardData(CASES_URL, 'Global');
    let vaccinationData = await fetchDashboardData(VACCINE_URL, 'World');

    secOneText.innerText = `There are ${numberWithCommas(worldData.confirmed)} confirmed cases of COVID-19 around the world.`;
    secTwoText.innerText = `As of now, 1,257,429 more people are expected to die.`;
    secThreeText.innerText = `${numberWithCommas(worldData.recovered)} people are currently treated.`;
    secThreePText.innerText = `That's 34% of all cases that are still in hospital right now.`;
    secFourText.innerText = `To date, the world has vaccinated ${numberWithCommas(vaccinationData.people_vaccinated)} people.`;
    secFourP1Text.innerText = `That's the amount of people that have received all jabs required to be immune. In total, the vaccine has been administered ${numberWithCommas(vaccinationData.administered)} times.`;
    secFourP2Text.innerText = `There's ${numberWithCommas(vaccinationData.people_partially_vaccinated)} still waiting for their second shot.`;
    loading();
}

async function fetchDashboardData(url, country){
    let dashboardData;
    const response = await fetch(url);
    const data = await response.json();

    for(let e in data){
        if(e === country){
            dashboardData = data[e].All;
        }
    }
    return dashboardData;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}