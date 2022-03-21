//Startup Equity Exit Calculator
//Dan Trapp 

//Query Selectors
const equityCalc = document.querySelector('#equity-calculator'); //equity calculator container
const equityDataContainer = document.querySelector('#equity-data-container'); //equity calculator container
let listData = []; //original UGI form data + calculations on UGI data. 

//FORMATTING

const number = formatUSD = new Intl.NumberFormat('en-us')

const dollar = formatUSD = new Intl.NumberFormat('en-us', {style: 'currency', currency: 'USD'})

const percent = formatPercent = new Intl.NumberFormat('en-us', {style: 'percent', maximumFractionDigits: 2});



//FUNCTIONS
function handleFormSubmit(e){
  e.preventDefault(); //prevent page refresh on form

  //User Generated Input
  //use DOMPurify to sanitize the UGI from CSS attacks.
  const mc = DOMPurify.sanitize(equityCalc.querySelector('#marketcap').value);
  const granted = DOMPurify.sanitize(equityCalc.querySelector('#granted').value);
  const exercised = DOMPurify.sanitize(equityCalc.querySelector('#exercised').value);
  const equityPercentage = DOMPurify.sanitize(equityCalc.querySelector('#equity-percentage').value);
  const sell = DOMPurify.sanitize(equityCalc.querySelector('#sell').value);
  const rounds = DOMPurify.sanitize(equityCalc.querySelector('#total-rounds').value);

  //calculations from UGI form data
  const tCMC = mc * 1_000_000;//total current market cap;
  const gMC = granted * 1_000_000;//market cap at grant;
  const tMCE = exercised * 1_000_000;//market cap at grant;
  const eqPF = equityPercentage / 100; //equityPercentage Formula
  const pricePerShareCurrent = (tCMC / 10_000_000);
  const pricePerShareGrant = (gMC / 10_000_000);
  const pricePerShareEx = (tMCE / 10_000_000);
  const shares = (10_000_000 * eqPF);//based on market cap at grant;
  const shareValueAtGrant = (pricePerShareGrant * shares);//value of shares at grant;
  const currentShareValue = (pricePerShareCurrent * shares);//value of shares at grant;
  const costToExercise = (pricePerShareEx * shares);//cost to exercise shares;

  //DILUTION CALCULATIONS
  function getDilution(x) {
    const dilutionRounds = [0.8, 0.64, 0.544, 0.4896, 0.44064, 0.396576, 0.3569184];
    return dilutionRounds[x - 1] //total diluted equity percentage remaining
  }

  const dilutedEquityPercentage = eqPF * (getDilution(rounds) * 100);
  const dilutedEquityValue = (tCMC / 100) * dilutedEquityPercentage;

  //SELL SHARES CALCULATIONS
  const soldShares = shares * sell; //50_000 shares x 50%
  const soldShareValue = dilutedEquityValue * sell; //ex. $10_000_000 x 50%
  const remainingShares = shares - soldShares;
  const remainingShareValue = dilutedEquityValue - soldShareValue;
  const remainingEquityPercentage = dilutedEquityPercentage * (1 - sell);
  const perShareProfit = soldShareValue - (costToExercise * sell);

//add UGI data + ID (date stamp) to newData object to push to listData for later use (ex. item.mc, .etc)
  const newData = {
    mc,
    tCMC, 
    gMC,
    tMCE,
    shares,
    eqPF,
    shareValueAtGrant, 
    currentShareValue,
    pricePerShareCurrent,
    pricePerShareGrant,
    pricePerShareEx,
    costToExercise,
    granted, 
    exercised,
    equityPercentage,
    sell,
    soldShares,
    soldShareValue,
    remainingShares,
    remainingShareValue,
    remainingEquityPercentage,
    perShareProfit,
    rounds,
    dilutedEquityPercentage,
    dilutedEquityValue,
    id: Date.now(), //add comma for later use if needed

  }

  listData.push(newData); //add data to listData
  
  e.target.reset(); //COMMENT THIS IF YOU DON'T WANT TO CLEAR THE FORM AFTER SUBMITTING DATA!!!

  equityDataContainer.dispatchEvent(new CustomEvent('refreshData')); //create a new custom event to refresh data from an event handler

  //displayData(); //execute display data function
}


//ONKEYUP: Print Realtime Form Input In Separate
//x = mc; y = mcR


function realTimeText(x, y){
  let formInput = document.getElementById(x);
   formInput.onkeyup = function(){
     document.getElementById(y).innerHTML = formInput.value;
   }
  }

 realTimeText('granted', 'grantedR');

//function to map listData array items, perform calculations and push to calcData array 

function displayData(){

  //populate the UI from listData map
  const tempString = listData.map(item => `
  <div class="row mb-4 border-bottom border-5 border-primary">
  <p class="h3 text-dark">Equity Data</p>
  </div>
  <div class="row gy-2">
    <div class="col">
      <div class="card mb-4 rounded-5 shadow-sm border-light">
       <div class="card-header py-3 text-white bg-dark bg-gradient border-light">
          <h4 class="my-4">Market Cap ${dollar.format(item.tCMC)}</h4>
          </div>
        <div class="card-body">
        <ul class="text-start">

        <div class="row gy-1 p-5 m-1 gx-5 shadow-sm rounded-3 border" style="background-color: #fff;">
        <h4 class="h3 text-primary">Quick Numbers</h4>
        <li><b>Total Company Market Cap (FMV):</b> ${dollar.format(item.tCMC)}</li>
        <li><b>Your Total Equity Stake Value (diluted):</b> ${dollar.format(item.dilutedEquityValue)}</li>
        <li><b>Your Total Equity Stake (diluted from ${percent.format(item.equityPercentage / 100)}):</b> ${percent.format(item.dilutedEquityPercentage / 100)}</li>
        <li><b>Shares Sold:</b> ${number.format(item.soldShares)}</li>
        <li><b>Shares Sold Value:</b> ${dollar.format(item.soldShareValue)}</li>
        <li><b>Total Pre-Tax Profit From Share Sale:</b> ${dollar.format(item.perShareProfit)}</li>
        <li><b>Your Remaining Shares:</b> ${number.format(item.remainingShares)}</li>
        <li><b>Value Of Remaining Shares:</b> ${dollar.format(item.remainingShareValue)}</li>
        <li><b>Remaining Equity Stake:</b> ${percent.format(item.remainingEquityPercentage / 100)}</li>
        </br>
        </div>


        <div class="row gy-1 p-5 m-1 gx-5 shadow-sm rounded-3 border bg-light bg-gradient">
        <h4 class="h3 text-primary">Grant Date Values</h4>
        <p>These are the values of your equity/options at grant. For those who are granted shares pre-seed or at the seed stage as a founder or early employee, your strike price may be at or near par value of $0.001/share and would be filing a 83b election for Full Market Value of your equity stake (FMV) with the IRS within 30 days of grant date. In some cases the company will already have a 409a valuation at the seed stage and the current FMV divided by the total authorized shares of the company (typically 10m at formation) is the basis for strike price at grant. </p>
        <li><b>Market Cap When Shares Granted:</b> ${dollar.format(item.gMC)}</li>
        <li>Initial Equity Percentage: ${percent.format(item.equityPercentage / 100)}</li>
        <li>Total Number Of Shares: ${number.format(item.shares)}</li>
        <li>Total Per Share Value (strike price) At Grant: ${dollar.format(item.pricePerShareGrant)}</li>
        <li>Total Value Of Shares At Grant: ${dollar.format(item.shareValueAtGrant)}</li>
        </br>
        </div>


        <div class="row gy-1 p-5 m-1 gx-5 shadow-sm rounded-3 border" style="background-color: #FFF;">
        <h4 class="h3 text-primary">Dilution Values</h4>
        <p>These are the estimated dilution values of your equity from funding rounds. As a rough estimate we use this formula for dilution (Series A: 20%, Series B: 20%, Series C: 15%, Series D - F: 10%) if your company has raised 3 rounds post-seed, they're at a Series C stage and your equity has been diluted to around 49% of your initial ${percent.format(item.equityPercentage / 100)} equity stake.</p>
        <li>Total Funding Rounds: ${item.rounds}</li>
        <li>Total Diluted Equity Percentage Remaining: ${percent.format(item.dilutedEquityPercentage /100)}</li>
        <li>Current Equity Value After Dilution: ${dollar.format(item.dilutedEquityValue)}</li>
        </br>
        </div>

        <div class="row gy-1 p-5 m-1 gx-5 shadow-sm rounded-3 border bg-light bg-gradient">
        <h4 class="h3 text-primary">Exercise Values</h4>
        <li>Total Per Share Value At Exercise: ${dollar.format(item.pricePerShareEx)}</li>
        <li>Total Cost To Exercise (${number.format(item.shares)}) Shares: ${dollar.format(item.costToExercise)}</li>
        <li>Current Total Per Share Value: ${dollar.format(item.pricePerShareCurrent)}</li>
        </br>
        </div>

        <div class="row gy-1 p-5 m-1 gx-5 shadow-sm rounded-3 border">
        <h4 class="h3 text-primary">Exit Values</h4>
        <li><b>Market Cap When Shares Exercised/Purchased:</b> ${dollar.format(item.tMCE)}</li>
        <li>Shares Sold: ${number.format(item.soldShares)}</li>
        <li>Shares Sold Value: ${dollar.format(item.soldShareValue)}</li>
        <li>Total Pre-Tax Profit From Share Sale: ${dollar.format(item.perShareProfit)}</li>
        <li>Shares Remaining: ${number.format(item.remainingShares)}</li>
        </div>
      

        </ul>
        <button class="btn btn-lg btn-outline-danger" value = "${item.id}">Delete</button>
            </div>
          </div>
        </div>
       </div>

    
  `
  ).join(''); //don't forget to add join, son!

  equityDataContainer.innerHTML = tempString; //push tempstring to equity data container on index.html to see calculations output
}

//Mirror State To Local Storage; take the current state of the UI and store it in the users Local Storage. TBD if the live version will include this feature, it's more gimmicky than helpful in this instance. 
function mirrorState(){
  localStorage.setItem('equityDataContainer.list', JSON.stringify(listData)); 
}

//check users local storage. If null or equal to empty array (if deleted during session), we clearly don't want to try to pull nothing from local storage and display it...because...um...there would be nothing and wouldn't display. 
function initLoadUI(){
  const tempLocalStorage = localStorage.getItem('equityDataContainer.list')
  if (tempLocalStorage === null || tempLocalStorage === [])return;
  const tempData = JSON.parse(tempLocalStorage);
  listData.push(...tempData); //if we good, we good. Parse it & Push it. 
  equityDataContainer.dispatchEvent(new CustomEvent('refreshData')); //we want to dispatch this again here. 

  }

  function deleteDataFromList(id){
    listData = listData.filter(item => item.id !== id); //return everything but the item that matches the id (i). 
    equityDataContainer.dispatchEvent(new CustomEvent('refreshData')); //dispatch new event again for final step.
  }

//EVENT LISTENERS

equityCalc.addEventListener('submit', handleFormSubmit); //browser runs 
equityDataContainer.addEventListener('refreshData', displayData); //refresh equity data
equityDataContainer.addEventListener('refreshData', mirrorState); //push state to local storage
window.addEventListener('DOMContentLoaded', initLoadUI);
equityDataContainer.addEventListener('click', e => {
  if(e.target.matches('.btn-outline-danger')){
    deleteDataFromList(Number(e.target.value)) //target the button value; convert to number so we can use it as an ID to delete using Date.now())
  };
})//user deletes the equity data cards from local storage; check for event 'click' in the container (since the button isn't available to target) and build the delete function.

