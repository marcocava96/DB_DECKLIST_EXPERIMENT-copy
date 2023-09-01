//!ELEMENTI HTML
// SELECT DECKS
let decksSelect = document.querySelector("#decksSelect");
// DIV USERDECK
let divUserDeck = document.querySelector("#divUserDeck");
let mainDeckDiv = document.querySelector("#mainDeckDiv");
let sideDeckDiv = document.querySelector("#sideDeckDiv");
let extraDeckDiv = document.querySelector("#extraDeckDiv");
// BOTTONE CREA TABELLA
let createSideBtn = document.querySelector("#createSideBtn");
// DIV TABELLE
let divContenitoreTabelle = document.querySelector("#divContenitoreTabelle");
// URL FETCH
let URL = "http://localhost:3000/decks";

//! SELECT DINAMICA
decksSelect.addEventListener("click", async () => {
  // FETCH DECKS SALVATI SU DB
  let DECKS = await getDecksFromDb(URL);

  // ARR OF DECK NAMES
  let arrDecksNames = [];
  DECKS.forEach((deck) => {
    arrDecksNames.push(deck.deckName);
  });
  arrDecksNames.sort((a, b) => a.localeCompare(b));

  // ARR OF OPTIONS VALUES
  let optionsValues = [...decksSelect.options].map((option) => option.value);
  //console.log("test options", optionsValues);

  if (arrDecksNames.length > optionsValues.length) {
    // CREA OPTIONS DINAMICAMENTE E POPOLO SELECT
    for (let i = 0; i < arrDecksNames.length; i++) {
      let option = document.createElement("option");
      option.setAttribute("value", arrDecksNames[i]);
      option.textContent = arrDecksNames[i];
      optionsValues.push(option.value);
      decksSelect.appendChild(option);
    }
  }
});

//! EVENT LISTENER OPTIONS FROM SELECT
decksSelect.addEventListener("change", async () => {
  // PULISCO DIV
  divContenitoreTabelle.innerHTML = "";

  // OPTION VALUE (== NOME DECK)
  let optionValue = event.target.value;

  // FETCH DECKS SALVATI SU DB
  let DECKS = await getDecksFromDb(URL);

  let matchedDeckObject = "";

  // GUARDA TUTTI I DECK
  for (let i = 0; i < DECKS.length; i++) {
    // SE OPTION è UGUALE A NOME DI UN DECK, PRENDI QUEL DECK
    if (DECKS[i].deckName == optionValue) {
      matchedDeckObject = DECKS[i];
      break;
    }
  }

  // SALVO MATCHED DECK NELLA LOCAL STORAGE
  localStorage.setItem("matchedDeckObject", JSON.stringify(matchedDeckObject));

  // POPOLO I DIV CON MAIN/SIDE/EXTRA
  populateMainDiv(matchedDeckObject);
  populateSideDivOrExtraDiv(matchedDeckObject, "side", sideDeckDiv);
  populateSideDivOrExtraDiv(matchedDeckObject, "extra", extraDeckDiv);
});

//! CREO TABELLE PER SIDECKING
createSideBtn.addEventListener("click", () => {
  const userInput = prompt("Insert the name of the deck you're siding against");

  // CREO DIV TABELLA UNICO BASED ON USER INPUT
  let divTabella = document.createElement("div");
  divTabella.setAttribute("class", "tables")
  divTabella.setAttribute("id", userInput)
  divTabella.innerHTML = `
      <button class="editTableBtn_${userInput}">Edit Table</button>
      <h2 id="deckSidingVs">You are now siding against: ${userInput}</h2>
      <div class="colonne">
      <div id="sideOut">
        <h3 id="head3Out"><span></span>SIDE OUT:</h3>
        <div id="monsters"><span></span>MONSTERS</div>
        <div id="spells"><span></span>SPELLS</div>
        <div id="traps"><span></span>TRAPS</div>
      </div>

      <div id="sideIn">
      <h3 id="head3In"><span></span>SIDE IN:</h3>
      <div id="monsters"><span></span>MONSTERS</div>
      <div id="spells"><span></span>SPELLS</div>
      <div id="traps"><span></span>TRAPS</div>
      </div>
      </div>
    `;
  // APPENDO TABELLA A CONTENITORE TABELLE
  divContenitoreTabelle.append(divTabella)
  console.log("test bau div tabella", divTabella);
  console.log("test bau 2222 div tabella id", divTabella.id);
  let divTabellaId = divTabella.id;

  // EVENT LISTENER TASTO EDIT
  document.querySelector(`.editTableBtn_${userInput}`).addEventListener("click", () => {
    console.log("clicked edit button " + userInput);
    addEventListenerToCards(divTabellaId);
  })
});

//* NEW FUNCTIONS LIST
async function getDecksFromDb(URL) {
  try {
    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const DECKS = await response.json();
    return DECKS;
  } catch (error) {
    console.error("Error:", error);
    throw error; // Re-throw the error to propagate it further if needed
  }
}

function populateMainDiv(matchedDeckObject) {
  // PULISCO DIV
  mainDeckDiv.innerHTML = "";

  let mainDeck = matchedDeckObject.main
  let numeroRigheDiv = mainDeck.length / 10;
  let counter = 0;

  // // CREO ARRAY DI OGGETTI CONTENENTI INFO CARTA (NOME, TIPO)
  // let arrCardsInfoObject = [];

  for (let i = 0; i < numeroRigheDiv; i++) {
    if (i > 0) {
      counter += 10;
    }
    // 1. CREO RIGA
    let divRiga = document.createElement("div");
    divRiga.setAttribute("class", "rigaMain");

    // 2. RIEMPIO RIGA
    for (let j = 0; j < mainDeck.length; j++) {
      //console.log("sono counter", counter);
      if (j >= counter && j <= counter + 9) {
        // CREO CARD
        let card = document.createElement("div");
        card.setAttribute("class", "cards");
        card.innerHTML = `
          <img src=${mainDeck[j].img} alt="">`;
        // APPENDO CARD A DIV RIGA
        divRiga.append(card);

        // // SALVO IN arrCardsInfoObject LE INFO DELLA CARTA
        // arrCardsInfoObject.push({
        //   [mainDeck[j].name]: mainDeck[j].type
        // })

      }
    } // fine loop j
    // 3. APPEND RIGA A MAINDECK DIV
    mainDeckDiv.append(divRiga);
  } //fine loop i
  // // SALVO IN LOCAL STORAGE cardsInfoObject
  // localStorage.setItem("cardsInfoObject", arrCardsInfoObject);
  // console.log(arrCardsInfoObject);
}

function populateSideDivOrExtraDiv(matchedDeckObject, subDeckName, deckDiv) {
  // PULISCO DIV
  deckDiv.innerHTML = "";

  // // CREO ARRAY DI OGGETTI CONTENENTI INFO CARTA (NOME, TIPO)
  // let arrCardsInfoObject = [];

  let subDeck = matchedDeckObject[subDeckName];

  if (subDeckName == "side" || subDeckName == "extra") {
    // POPOLO SIDE/EXTRA DIV CON IMG CARDS
    subDeck.forEach((card) => {
      // CREO CARD
      let cardDiv = document.createElement("div");
      cardDiv.setAttribute("class", "cards");
      cardDiv.innerHTML = `<img src=${card.img} alt="">`;
      // APPEND CARD
      deckDiv.append(cardDiv);

      // // SALVO IN arrCardsInfoObject LE INFO DELLA CARTA
      // arrCardsInfoObject.push({
      //   [card.name]: card.type
      // })
    });
    // // SALVO IN LOCAL STORAGE cardsInfoObject
    // localStorage.setItem("cardsInfoObject", arrCardsInfoObject);
    // console.log(arrCardsInfoObject);
  }
}

function addEventListenerToCards(divTabella) {

  console.log("firing insertCardIntoSideTable");

  // recupero tutte le cardDiv di main/side/extra dai rispettivi Divs!
  let arrMainDeckCards = Array.from(mainDeckDiv.querySelectorAll(".cards"))

  // aggiungo event listener a ogni carta
  arrMainDeckCards.forEach(cardDiv => {
    cardDiv.addEventListener("click", () => {
      let cardDivImgUrl = cardDiv.querySelector("img").getAttribute("src");
      console.log("test card img url", cardDivImgUrl);
      inseriscoCardinColonna(divTabella, cardDivImgUrl)
    })
  })
}

// 🤯🤯🤯(3rd layer) FUNCTIONS
function inseriscoCardinColonna(divTabellaId, cardDivImgUrl) {

  // MATCHED DECK
  let matchedDeck = JSON.parse(localStorage.getItem("matchedDeckObject"));
  console.log("test matchedDeck");
  console.log(matchedDeck);

  // TABELLA
  let tabellaId = divTabellaId;
  console.log("test tabella id inserisco card", tabellaId);
  
  let tabellaDiv = document.getElementById(tabellaId)
  console.log("test tabella DIV inserisco card", tabellaDiv);
  // SPAN colonnaSide
  // let h3SpanSide = Number(tabella.querySelector("h3").querySelector("span").textContent);
  // let cardTypeDiv = "";

  let cardName = "";
  let cardType = "";
  // CARD QUANTITY
  let cardQuantity = 0;
  for (let i = 0; i < matchedDeck.main.length; i++) {
    if (cardDivImgUrl == matchedDeck.main[i].img) {
      cardQuantity++
      cardName = matchedDeck.main[i].name;
      cardType = matchedDeck.main[i].type;
    }
  }
  console.log("test cardQuantit", cardQuantity);

  const QUANTITA_MAX_CARTE_SIDEABILI = 15;

  // SE CARD DIV CON ID "cardName" NON ESISTE LO CREO E INSERISCO
  let cardDiv = document.createElement("div");
  cardDiv.innerHTML = `
                        <div class="tableCard">
                        <button class="btnMinus">-</button>
                        <p><span>1</span>
                        ${cardName}</p>
                        </div>
                        `;
  // // DIV TIPO DI CARTA (MONSTERS, SPELLS, TRAPS)
  // if (cardType == "Effect Monster" ||
  //   cardType == "Normal Monster" ||
  //   cardType == "Tuner Monster" ||
  //   cardType == "Ritual Monster") {
  //   cardTypeDiv = "monsters";
  // } else if (cardType == "Spell Card") {
  //   cardTypeDiv = "spells";
  // } else {
  //   cardTypeDiv = "traps";
  // }
  // APPEND 
  tabellaDiv.querySelector("#sideOut").append(cardDiv);
  // EVENT LISTENER
  cardDiv.addEventListener("click", () => {
    console.log("inserire removecard function");
  });
}