//!ELEMENTI HTML
let decksSelect = document.querySelector("#decksSelect");
let divUserDeck = document.querySelector("#divUserDeck");
let mainDeckDiv = document.querySelector("#mainDeckDiv");
let sideDeckDiv = document.querySelector("#sideDeckDiv");
let extraDeckDiv = document.querySelector("#extraDeckDiv");
let createSideBtn = document.querySelector("#createSideBtn");
let deleteAllTablesBtn = document.querySelector("#deleteAllTablesBtn");
let divContenitoreTabelle = document.querySelector("#divContenitoreTabelle");
let URL = "http://localhost:3000/decks";
let generatePdfButton = document.querySelector("#generatePdfButton")
const QUANTITA_MAX_CARTE_SIDEABILI = 15;
const QUANTITA_MAX_CARTA_SINGOLA = 3;





// SELECT DINAMICA
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

// EVENT LISTENER OPTIONS FROM SELECT
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
    if (optionValue == DECKS[i].deckName) {
      matchedDeckObject = DECKS[i];
      break;
    }
  }

  // SALVO MATCHED DECK NELLA LOCAL STORAGE
  localStorage.setItem("matchedDeckObject", JSON.stringify(matchedDeckObject));

  // POPOLO SUBDECKS
  popoloSubdecks();
});

// createSideBtn (CREO DIV TABELLA con ID UNICO BASED ON USER INPUT)
createSideBtn.addEventListener("click", () => {

  // RISCARICO IL DECK PER "RESETTARE" LE CARTE DAI VARI EVENT LISTENERS
  popoloSubdecks();

  // CONTROLLO USER INPUT
  let userInputObject = controlloUserInputVsNomiTabelle(".tables");

  // CREAZIONE TABELLA
  let divTabellaId = creaDivTabella(userInputObject);

  // COLLEGGO EVENT LISTENER A TUTTE LE CARTE 
  addEventListenerToCardDivs(divTabellaId, mainDeckDiv, "sideOut");
  addEventListenerToCardDivs(divTabellaId, sideDeckDiv, "sideIn");
  addEventListenerToCardDivs(divTabellaId, extraDeckDiv, "sideOut");

  // AGGIUNGTO EVENT LISTENERS AI BOTTONI di questa tabella
  aggiungoEltoBtns(divTabellaId)

  // ORDINO TABELLE IN ALFABETICO
  ordinoTabelleInAlfabetico();
})

// CANCELLO TUTTE LE TABELLE
deleteAllTablesBtn.addEventListener("click", () => {
  divContenitoreTabelle.innerHTML = "";
})

// PRINT TABELLE (DA FIXARE)
generatePdfButton.addEventListener("click", () => {

  let element = divContenitoreTabelle;
  let opt = {
    margin: 0,
    filename: 'mySideDeck.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1, scrollY: 0 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  // New Promise-based usage:
  html2pdf().set(opt).from(element).save();
})





// !FUNCTIONS
// SELECT
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

function popoloSubdecks() {
  // PRENDO MATCHED DECK DALLA LOCAL STORAGE
  let matchedDeckObject = JSON.parse(localStorage.getItem("matchedDeckObject"));

  // POPOLO I DIV CON MAIN/SIDE/EXTRA
  populateSubDeckDiv(matchedDeckObject, "main", mainDeckDiv);
  populateSubDeckDiv(matchedDeckObject, "side", sideDeckDiv);
  populateSubDeckDiv(matchedDeckObject, "extra", extraDeckDiv);
}

function populateSubDeckDiv(matchedDeckObject, subDeckName, deckDiv) {
  // PULISCO DIV
  deckDiv.innerHTML = "";

  let subDeck = matchedDeckObject[subDeckName];

  let id = 1;

  if (subDeckName == "side" || subDeckName == "extra") {

    // POPOLO SIDE/EXTRA DIV CON IMG CARDS
    subDeck.forEach((card) => {

      // CREO CARD
      let cardDiv = document.createElement("div");
      cardDiv.setAttribute("id", "id" + subDeckName + (id++));
      cardDiv.setAttribute("class", "cardDiv");
      cardDiv.innerHTML = `<img src=${card.img} alt="">`;
      cardDiv.dataset.name = card.name;
      cardDiv.dataset.type = card.type;

      // APPEND CARD
      deckDiv.append(cardDiv);
    });
  } else if (subDeckName == "main") {

    // POPOLO MAIN DECK
    let mainDeck = subDeck;
    let numeroRigheDiv = mainDeck.length / 10;
    let counter = 0;

    for (let i = 0; i < numeroRigheDiv; i++) {
      if (i > 0) {
        counter += 10;
      }
      // 1. CREO RIGA
      let divRiga = document.createElement("div");
      divRiga.setAttribute("class", "rigaMain");

      // 2. RIEMPIO RIGA
      for (let j = 0; j < mainDeck.length; j++) {
        if (j >= counter && j <= counter + 9) {
          // CREO CARD
          let cardDiv = document.createElement("div");
          cardDiv.setAttribute("id", "id" + subDeckName + (id++));
          cardDiv.setAttribute("class", "cardDiv");
          cardDiv.innerHTML = `<img src=${mainDeck[j].img} alt="">`;
          cardDiv.dataset.name = mainDeck[j].name;
          cardDiv.dataset.type = mainDeck[j].type;

          // APPEND CARD
          divRiga.append(cardDiv);
        }
      } // fine loop j
      // 3. APPEND RIGA A MAINDECK DIV
      deckDiv.append(divRiga);
    } //fine loop i
  }
}



// CREATESIDE BTN EVENT LISTENER
function controlloUserInputVsNomiTabelle(tablesClassName) {
  // DEVO CONTROLLARE CHE IL NUOVO NOME NON MATCHI QUELLO DI UN'ALTRA TABELLA
  // RACCOLGO NOMI TABELLE
  let arrTablesNames = [];
  // recupero tutte le tabelle e i loro nomi
  let arrTables = Array.from(divContenitoreTabelle.querySelectorAll(tablesClassName));
  arrTables.forEach(table => {
    arrTablesNames.push(table.id)
  });

  let userInputObject = {};

  while (true) {

    const userInput = prompt("Insert the name of the deck you're siding against");
    const userInputWithoutSpaces = userInput.replace(/[^a-zA-Z0-9-_]/g, '');

    if (arrTablesNames.includes(userInputWithoutSpaces)) {
      alert("Esiste già una tabella con questo nome!");
    } else {
      userInputObject = {
        asInput: userInput,
        noSpaces: userInputWithoutSpaces
      }
      break;
    }
  }
  return userInputObject;
}

function creaDivTabella(userInputObject) {

  let divTabella = document.createElement("div");
  divTabella.setAttribute("class", "tables table")
  divTabella.setAttribute("id", userInputObject.noSpaces)
  divTabella.innerHTML = `
                            <div class="going_first "stacked-div1">
                              <h2 id="deckSidingVs">Siding VS: ${userInputObject.asInput}</h2>
                              <h3>Going First</h3>
                              <div id="inline-buttons">
                                <button class="editTableNameBtn">Edit Table Name</button>
                                <button class="editTableBtn">Edit Table</button>
                                <button class="duplicateTableBtn">Duplicate Table</button>
                                <button class="deleteTableBtn">Delete Table</button>
                              </div>
                            </div>
  
                            <div class="colonne">
                              <div id="sideOut">
                                <h3 id="head3Out"><span></span>SIDE OUT:</h3>
                                <div id="monsters"><span></span></div>
                                <div id="spells"><span></span></div>
                                <div id="traps"><span></span></div>
                                <div id="extra_fusion"><span></span></div>
                                <div id="extra_synchro"><span></span></div>
                                <div id="extra_xyz"><span></span></div>
                              </div>
  
                              <div id="sideIn">
                                <h3 id="head3In"><span></span>SIDE IN:</h3>
                                <div id="monsters"><span></span></div>
                                <div id="spells"><span></span></div>
                                <div id="traps"><span></span></div>
                                <div id="extra_fusion"><span></span></div>
                                <div id="extra_synchro"><span></span></div>
                                <div id="extra_xyz"><span></span></div>
                              </div>
                            </div>

                            ***

                            <div class="going_second "stacked-div2">
                              <h2 id="deckSidingVs">Siding VS: ${userInputObject.asInput}</h2>
                              <h3>Going Second</h3>
                              <div id="inline-buttons">
                                <button class="editTableNameBtn">Edit Table Name</button>
                                <button class="editTableBtn">Edit Table</button>
                                <button class="duplicateTableBtn">Duplicate Table</button>
                                <button class="deleteTableBtn">Delete Table</button>
                              </div>
                            </div>
  
                            <div class="colonne">
                              <div id="sideOut">
                                <h3 id="head3Out"><span></span>SIDE OUT:</h3>
                                <div id="monsters"><span></span></div>
                                <div id="spells"><span></span></div>
                                <div id="traps"><span></span></div>
                                <div id="extra_fusion"><span></span></div>
                                <div id="extra_synchro"><span></span></div>
                                <div id="extra_xyz"><span></span></div>
                              </div>
  
                              <div id="sideIn">
                                <h3 id="head3In"><span></span>SIDE IN:</h3>
                                <div id="monsters"><span></span></div>
                                <div id="spells"><span></span></div>
                                <div id="traps"><span></span></div>
                                <div id="extra_fusion"><span></span></div>
                                <div id="extra_synchro"><span></span></div>
                                <div id="extra_xyz"><span></span></div>
                              </div>
                            </div>
                          `;

  // APPENDO TABELLA A CONTENITORE TABELLE
  divContenitoreTabelle.append(divTabella)
  let divTabellaId = divTabella.id;

  return divTabellaId;
}

function addEventListenerToCardDivs(divTabellaId, subDeckDiv, colonnaSide) {

  // recupero tutte le cardDiv da subDeckDiv
  let arrSubDeckCards = Array.from(subDeckDiv.querySelectorAll(".cardDiv"))

  // aggiungo event listener a ogni cardDiv
  arrSubDeckCards.forEach(cardDiv => {
    cardDiv.addEventListener("click", () => {

      // scroll into view feature
      document.getElementById(divTabellaId).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      //INSERISCO NOME CARD IN COLONNA TABELLA SE CLICKATA
      inseriscoCardinColonna(divTabellaId, colonnaSide, cardDiv, subDeckDiv)
    })
  })
}

function inseriscoCardinColonna(divTabellaId, colonnaSide, cardDiv, subDeckDiv) {

  // RECUPERO NOME, TIPO di cardDiv
  let cardDivName = cardDiv.dataset.name;
  let cardDivType = cardDiv.dataset.type;

  // RECUPERO TABELLA e H3 colonnaSide
  let tabellaDiv = document.getElementById(divTabellaId)
  let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);

  if (h3SpanSide < QUANTITA_MAX_CARTE_SIDEABILI) {

    // SE DIV NOME CARTA CON DATA ATTRIBUTE == "cardName" MA senza greenBorder Class ESISTE, LA AGGIORNO
    if (tabellaDiv.querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`) && !cardDiv.classList.contains("greenBorder")) {

      console.log("nome carta tabella aggiornata");

      // aggiungo bordo alla carta
      cardDiv.classList.add("greenBorder")

      // recupero card span
      let cardSpan = Number(tabellaDiv.querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`).querySelector("span").innerHTML);
      console.log("log card span", cardSpan);

      if (cardSpan < QUANTITA_MAX_CARTA_SINGOLA) {
        // AGGIORNO SPAN HEADER
        tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide + 1 + " ";
        // AGGIORNO SPAN CARD
        tabellaDiv.querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`).querySelector("span").innerHTML = cardSpan + 1 + " ";
      }
      // SE DIV NOME CARTA CON DATA ATTRIBUTE == "cardName" E con greenBorder Class ESISTE, LA AGGIORNO
    } else if (tabellaDiv.querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`) && cardDiv.classList.contains("greenBorder")) {

      console.log("hai già clickato questa carta");

    } else {// SE CARDnameDIV NON ESISTE LO CREO E INSERISCO

      console.log("nome carta tabella creata");

      // aggiungo bordo alla carta
      cardDiv.classList.add("greenBorder")

      // AGGIORNO SPAN HEADER
      tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide + 1 + " ";

      // CREO DIV NOME CARTA
      let cardNameDiv = creoNomiPerTabella(cardDivName);

      // DIV TIPO DI CARTA (MONSTERS, SPELLS, TRAPS)
      let cardTypeDiv = assegnoTipoCartaADivTipo(cardDivType, cardNameDiv);

      // APPEND A CARD TYPE DIV DI TABELLA
      tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).appendChild(cardNameDiv);

      // EVENT LISTENER
      cardNameDiv.addEventListener("click", () => {
        removeCard(tabellaDiv, colonnaSide, cardNameDiv, cardDivName, cardTypeDiv, subDeckDiv)
      });

      // ORDINO DIV NOMI CARTE IN ORDINE ALFABETICO
      ordinaNomiCarteNellaTabella(tabellaDiv, colonnaSide, cardTypeDiv)
    }
  }
}

function creoNomiPerTabella(cardDivName) {
  // CREO DIV NOME CARTA
  let cardNameDiv = document.createElement("div");
  // cardNameDiv.setAttribute("id", cardDiv.id)
  cardNameDiv.dataset.cardName = cardDivName;
  cardNameDiv.setAttribute("class", "tableCard");
  cardNameDiv.classList.add("cardNameDiv");
  cardNameDiv.innerHTML = `<div class="nomiCarte"><button class="btnMinus">-</button><span>1</span><p>${cardDivName}</p></div>`;

  return cardNameDiv;
}

function assegnoTipoCartaADivTipo(cardDivType, cardNameDiv) {
  // DIV TIPO DI CARTA (MONSTERS, SPELLS, TRAPS)
  let cardTypeDiv = "";
  if (cardDivType == "Effect Monster" || cardDivType == "Normal Monster" || cardDivType == "Tuner Monster" || cardDivType == "Ritual Monster") {
    cardTypeDiv = "monsters";
    cardNameDiv.classList.add("orangeBackground");
  } else if (cardDivType == "Spell Card") {
    cardTypeDiv = "spells";
    cardNameDiv.classList.add("greenBackground");
  } else if (cardDivType == "Trap Card") {
    cardTypeDiv = "traps";
    cardNameDiv.classList.add("purpleBackground")
  } else if (cardDivType == "Fusion Monster") {
    cardTypeDiv = "extra_fusion";
    cardNameDiv.classList.add("darkPurpleBackground")
  } else if (cardDivType == "Synchro Monster" || cardDivType == "Synchro Tuner Monster") {
    cardTypeDiv = "extra_synchro";
    cardNameDiv.classList.add("whiteBackground")
  } else if (cardDivType == "XYZ Monster") {
    cardTypeDiv = "extra_xyz";
    cardNameDiv.classList.add("blackBackground")
  }

  return cardTypeDiv;
}

function ordinaNomiCarteNellaTabella(tabellaDiv, colonnaSide, cardTypeDiv) {
  // ORDINO CARTE IN ORDINE ALFABETICO (provare a mettere in funzione a parte)
  // RACCOLGO NOMI TABELLE
  let arrCardNames = [];

  // recupero tutte le carte e i loro nomi
  let arrCardDivs = Array.from(tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).querySelectorAll(".tableCard"));
  arrCardDivs.forEach(cardElement => {
    // console.log(cardElement.querySelector("p").textContent);
    arrCardNames.push(cardElement.querySelector("p").textContent);
  });

  // sorto array di nomi
  arrCardNames.sort()
  // console.log("test arrCardDivs", arrCardNames);
  // svuoto contenitore tabelle
  cardTypeDiv.innerHTML = "";

  // itero array nomi
  for (let i = 0; i < arrCardNames.length; i++) {
    // console.log(arrCardNames[i]);
    // per ogni nome, cerco il suo divContenitoreTabelle e lo appendo divContenitoreTabelle
    for (let j = 0; j < arrCardDivs.length; j++) {
      if (arrCardNames[i] == arrCardDivs[j].querySelector("p").textContent) {
        tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).append(arrCardDivs[j]);
      }
    }
  }
}

function removeCard(tabellaDiv, colonnaSide, cardNameDiv, cardDivName, cardTypeDiv, subDeckDiv) {

  console.log("REMOVE CARD 1111");

  // recupero tutte le cardDiv da subDeckDiv
  let arrSubDeckCards = Array.from(subDeckDiv.querySelectorAll(".cardDiv"))

  for (let i = 0; i < arrSubDeckCards.length; i++) {
    if (arrSubDeckCards[i].classList.contains("greenBorder") && arrSubDeckCards[i].dataset.name == cardDivName) {
      arrSubDeckCards[i].classList.remove("greenBorder");
      break;
    }
  }

  // RECUPERO SPAN H3 colonnaSide
  let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);
  // RIDUCO DI 1 IL CONTATORE COLONNA
  tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide - 1 + " ";
  // RECUPERO SPAN cardNameDiv
  let cardSpan = Number(cardNameDiv.querySelector("span").textContent);

  if (cardSpan > 1) {
    // RIDUCO DI 1 SPAN CARD
    tabellaDiv.querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`).querySelector("span").innerHTML = cardSpan - 1 + " ";
  } else {
    // RIMUOVO cardNameDiv
    tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).removeChild(cardNameDiv);
  }
}

function ordinoTabelleInAlfabetico() {
  // RACCOLGO NOMI TABELLE
  let arrTablesNames = [];

  // recupero tutte le tabelle e i loro nomi
  let arrTables = Array.from(divContenitoreTabelle.querySelectorAll(".tables"));
  // console.log(arrTables);
  arrTables.forEach(table => {
    console.log(table.id);
    arrTablesNames.push(table.id)
  });

  // sorto array di nomi
  arrTablesNames.sort()
  // console.log(arrTablesNames);
  // svuoto contenitore tabelle
  divContenitoreTabelle.innerHTML = "";

  // itero array nomi
  for (let i = 0; i < arrTablesNames.length; i++) {
    // console.log(arrTablesNames[i]);
    // per ogni nome, cerco divTabella e la appendo divContenitoreTabelle
    for (let j = 0; j < arrTables.length; j++) {
      if (arrTablesNames[i] == arrTables[j].id) {
        divContenitoreTabelle.append(arrTables[j])
      }
    }
  }

}



// BOTTONI TABELLA
function aggiungoEltoBtns(divTabellaId) {

  // EDIT TABLE NAME
  aggiungoEltoEditTableNameBtn(divTabellaId);

  // // EDIT TABLE
  aggiungoEltoEditTableBtn(divTabellaId);

  // DUPLICATE TABLE
  aggiungoEltoDuplicateTableBtn(divTabellaId)

  // DELETE TABLE
  aggiungoEltoDeleteTableBtn(divTabellaId)
}

// EDIT TABLE NAME btn
function aggiungoEltoEditTableNameBtn(divTabellaId) {
  document.querySelector("#" + divTabellaId).querySelector(".editTableNameBtn").addEventListener("click", () => {

    // recupero tabella con id
    let originalTable = document.getElementById(divTabellaId);

    // chiedo e controllo USER INPUT per nuovo nome e id tabella
    let userInputObject = controlloUserInputVsNomiTabelle(".tables");
    let userInputObjectNoSpaces = userInputObject.noSpaces;

    // clono tabella
    let clonedTable = originalTable.cloneNode(true);
    clonedTable.id = userInputObjectNoSpaces

    // cambio testo h2 della tabella
    clonedTable.querySelector("h2").textContent = `Siding VS: ${userInputObject.asInput}`

    // SOSTITUISCO NEL DOM!
    originalTable.replaceWith(clonedTable)

    // DOPO AVER CAMBIATO ID E INSERITO NEL DOM LA TABELLA CLONATA FACCIO LE SEGUENTI COSE:
    // AGGIUNGTO EVENT LISTENERS AI BOTTONI
    aggiungoEltoBtns(clonedTable.id)

    // RISCARICO IL DECK PER "RESETTARE" LE CARTE DAI VARI EVENT LISTENERS
    popoloSubdecks();

    // COLLEGGO EVENT LISTENER A TUTTE LE CARTE 
    addEventListenerToCardDivs(clonedTable.id, mainDeckDiv, "sideOut", "main");
    addEventListenerToCardDivs(clonedTable.id, sideDeckDiv, "sideIn", "side");
    addEventListenerToCardDivs(clonedTable.id, extraDeckDiv, "sideOut", "extra");

    // AGGIUNGO GREEN BORDER A CARTE GIA PRESENTI
    aggiungoGreenBorderACardDiv(clonedTable, mainDeckDiv)
    aggiungoGreenBorderACardDiv(clonedTable, sideDeckDiv)
    aggiungoGreenBorderACardDiv(clonedTable, extraDeckDiv)

    // attacco alle carte della vecchia tabella event listener per rimuoverle
    // COLLEGO EVENT LISTENER A TUTTI I NOMI NELLA TABELLA
    removeCardNameDivforCLonedTable(clonedTable, mainDeckDiv, "sideOut");
    removeCardNameDivforCLonedTable(clonedTable, sideDeckDiv, "sideIn");
    removeCardNameDivforCLonedTable(clonedTable, extraDeckDiv, "sideOut");

    // ORDINO TABELLE IN ALFABETICO
    ordinoTabelleInAlfabetico();
  }
  )
}

// EDIT TABLE btn
function aggiungoEltoEditTableBtn(divTabellaId) {
  document.querySelector("#" + divTabellaId).querySelector(".editTableBtn").addEventListener("click", () => {

    let currentTable = document.querySelector("#" + divTabellaId);
    console.log("HAI CLICKATO IL TASTO: editTableBtn");

    // RIPOPOLO I DIV CON MAIN/SIDE/EXTRA in modo che gli event listener delle card si resettino dato che sto proprio creando nuovi Carddiv da zero)
    popoloSubdecks();

    // COLLEGGO EVENT LISTENER A TUTTE LE CARTE 
    addEventListenerToCardDivs(divTabellaId, mainDeckDiv, "sideOut", "main");
    addEventListenerToCardDivs(divTabellaId, sideDeckDiv, "sideIn", "side");
    addEventListenerToCardDivs(divTabellaId, extraDeckDiv, "sideOut", "extra");

    // AGGIUNGO GREEN BORDER A CARTE GIA PRESENTI
    aggiungoGreenBorderACardDiv(currentTable, mainDeckDiv)
    aggiungoGreenBorderACardDiv(currentTable, sideDeckDiv)
    aggiungoGreenBorderACardDiv(currentTable, extraDeckDiv)
  })
}

// DUPLICATE TABLE btn
// DUPLICATE TABLE btn
function aggiungoEltoDuplicateTableBtn(divTabellaId) {
  document.querySelector("#" + divTabellaId).querySelector(".duplicateTableBtn").addEventListener("click", () => {

    // recupero tabella con id
    let originalTable = document.getElementById(divTabellaId);

    // chiedo e controllo USER INPUT per nuovo nome e id tabella
    let userInputObject = controlloUserInputVsNomiTabelle(".tables");
    let userInputObjectNoSpaces = userInputObject.noSpaces;

    // clono tabella
    let clonedTable = originalTable.cloneNode(true);
    clonedTable.id = userInputObjectNoSpaces

    // cambio testo h2 della tabella
    clonedTable.querySelector("h2").textContent = `Siding VS: ${userInputObject.asInput}`

    // SOSTITUISCO NEL DOM!!! IMPORTANTISSIMO!!!
    divContenitoreTabelle.appendChild(clonedTable)

    // DOPO (!!!) AVER CAMBIATO ID E INSERITO NEL DOM LA TABELLA CLONATA FACCIO LE SEGUENTI COSE:
    // AGGIUNGTO EVENT LISTENERS AI BOTTONI
    aggiungoEltoBtns(clonedTable.id)

    // RISCARICO IL DECK PER "RESETTARE" LE CARTE DAI VARI EVENT LISTENERS
    popoloSubdecks();

    // COLLEGGO EVENT LISTENER A TUTTE LE CARTE 
    addEventListenerToCardDivs(clonedTable.id, mainDeckDiv, "sideOut", "main");
    addEventListenerToCardDivs(clonedTable.id, sideDeckDiv, "sideIn", "side");
    addEventListenerToCardDivs(clonedTable.id, extraDeckDiv, "sideOut", "extra");

    // AGGIUNGO GREEN BORDER A CARTE GIA PRESENTI
    aggiungoGreenBorderACardDiv(clonedTable, mainDeckDiv)
    aggiungoGreenBorderACardDiv(clonedTable, sideDeckDiv)
    aggiungoGreenBorderACardDiv(clonedTable, extraDeckDiv)

    // attacco alle carte della vecchia tabella event listener per rimuoverle
    // COLLEGO EVENT LISTENER A TUTTI I NOMI NELLA TABELLA
    removeCardNameDivforCLonedTable(clonedTable, mainDeckDiv, "sideOut");
    removeCardNameDivforCLonedTable(clonedTable, sideDeckDiv, "sideIn");
    removeCardNameDivforCLonedTable(clonedTable, extraDeckDiv, "sideOut");

    // ORDINO TABELLE IN ALFABETICO
    ordinoTabelleInAlfabetico();
  }
  )
}

// DELETE TABLE btn
function aggiungoEltoDeleteTableBtn(divTabellaId) {
  // EVENT LISTENER TASTO DELETE
  document.querySelector("#" + divTabellaId).querySelector(".deleteTableBtn").addEventListener("click", () => {

    console.log("HAI CLICKATO IL TASTO: deleteTableBtn");

    let tableToBeDeleted = document.querySelector("#" + divTabellaId)

    divContenitoreTabelle.removeChild(tableToBeDeleted);

    //rimuovo bordi verdi dal main deck
    let NodeListCardsinSubdeck = divUserDeck.querySelectorAll(".cardDiv");

    for (let j = 0; j < NodeListCardsinSubdeck.length; j++) {
      if (NodeListCardsinSubdeck[j].classList.contains("greenBorder")) {
        NodeListCardsinSubdeck[j].classList.remove("greenBorder");
      }
    }
  })
}

// simile a removeCard, assegna event listener alle carte della tabella clonata per rimuoverle
function removeCardNameDivforCLonedTable(tabellaDiv, subDeckDiv, colonnaSide) {

  // recupero nomi dalla tabella clonata 
  let arrCardNameDivs = Array.from(tabellaDiv.querySelector("#" + colonnaSide).querySelectorAll(".tableCard"));

  arrCardNameDivs.forEach(boxNome => {

    boxNome.addEventListener("click", () => {

      console.log("REMOVE CARD 222222");

      // RECUPERO SPAN H3 colonnaSide
      let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);

      // RECUPERO SPAN cardNameDiv
      let cardSpan = Number(boxNome.querySelector("span").textContent);

      //creo arrai di boxCarta dal subDeck
      let NodeListCardsinSubdeck = subDeckDiv.querySelectorAll(`[data-name="${boxNome.dataset.cardName}"]`);

      for (let j = 0; j < NodeListCardsinSubdeck.length; j++) {
        console.log("greenborder rimosso");
        if (subDeckDiv.contains(NodeListCardsinSubdeck[j]) && NodeListCardsinSubdeck[j].classList.contains("greenBorder")) {
          if (cardSpan > 1) {
            // RIDUCO DI 1 IL CONTATORE COLONNA
            tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide - 1 + " ";
            // RIDUCO DI 1 SPAN CARD
            boxNome.querySelector("span").innerHTML = cardSpan - 1 + " ";
            NodeListCardsinSubdeck[j].classList.remove("greenBorder");
            break;
          } else {
            // RIDUCO DI 1 IL CONTATORE COLONNA
            tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide - 1 + " ";
            // RIMUOVO CARD DIV
            NodeListCardsinSubdeck[j].classList.remove("greenBorder");
            boxNome.remove();
            break;
          }
        }
      }
    })
  });
}

function aggiungoGreenBorderACardDiv(clonedTable, subDeckDiv) {

  // recupero nome e quantità carta presenti nella tabella clonata 
  let arrCardNameDivs = Array.from(clonedTable.querySelectorAll(".tableCard"))
    .map(element => {
      let name = element.dataset.cardName;
      let quantity = Number(element.querySelector("span").innerHTML);

      return {
        name: name,
        quantity: quantity
      };
    });

  console.log("log array nom POST mapping", arrCardNameDivs);

  // per ogni boxNome nella tabella
  for (let i = 0; i < arrCardNameDivs.length; i++) {

    //creo arrai di boxCarta dal subDeck
    let NodeListCardsinSubdeck = subDeckDiv.querySelectorAll(`[data-name="${arrCardNameDivs[i].name}"]`);

    for (let j = 0; j < arrCardNameDivs[i].quantity; j++) {
      console.log("greenborder aggiunto");
      if (subDeckDiv.contains(NodeListCardsinSubdeck[j]) && !NodeListCardsinSubdeck[j].classList.contains("greenBorder")) {
        NodeListCardsinSubdeck[j].classList.add("greenBorder");
      }
    }
  }
}











