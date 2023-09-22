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

// CONSTANTS
const QUANTITA_MAX_CARTE_SIDEABILI = 15;
const QUANTITA_MAX_CARTA_SINGOLA = 3;
const arrSudDecksObj = [
  {
    divElement: mainDeckDiv,
    colonnaSide: "sideOut"
  },
  {
    divElement: sideDeckDiv,
    colonnaSide: "sideIn"
  },
  {
    divElement: extraDeckDiv,
    colonnaSide: "sideOut"
  }
]





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
  let thisTable = document.querySelector("#" + divTabellaId)

  // COLLEGGO EVENT LISTENER A TUTTE LE CARTE 
  addEventListenerToCardDivs(divTabellaId);

  //! QUI C'è QUALCOSA CHE NON TORNA
  // COLLEGO EVENT LISTENERS AI BOTTONI DELLA TABELLA
  aggiungoEltoBtns(divTabellaId)

  // COLLEGO EVENT LISTENER AI TABS DI QUESTA TABELLA!!!
  let nodeListTabs = thisTable.querySelectorAll('.nav-tabs li')
  nodeListTabs.forEach(tab => {
    // RECUPERO ID TAB
    let tabContentId = tab.querySelector("a").getAttribute('href').slice(1);

    tab.addEventListener("click", () => {
      removeGreenBorder();
      aggiungoGreenBorderACardDiv(thisTable, tabContentId);
    })
  })

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
                            <div class="container">

                            <ul class="nav nav-tabs">
                              <li class="active"><a data-toggle="tab" href="#${userInputObject.asInput}goingFirst">Going 1st</a></li>
                              <li><a data-toggle="tab" href="#${userInputObject.asInput}goingSecond">Going 2nd</a></li>
                            </ul>

                            <div class="tab-content">

                              <div id="${userInputObject.asInput}goingFirst" class="tab-pane fade in active goingFirst">
                                <div class="inline-elements">
                                  <h4 id="deckSidingVs">Siding VS: ${userInputObject.asInput}</h4>
                                  <div class="inline-buttons">
                                    <div class="upperBtns">
                                      <button class="editTableNameBtn custom-margin">Edit Name</button>
                                      <button class="editTableBtn custom-margin">Edit Table</button>
                                    </div>
                                    <div class="lowerBtns">
                                      <button class="duplicateTableBtn custom-margin">Duplicate</button>
                                      <button class="deleteTableBtn custom-margin">Delete</button>
                                    </div>
                                  </div>
                                </div>

                                <div class="colonne">
                                  <div class="sideOut">
                                    <h4 class="head3Out"><span></span>SIDE OUT:</h4>
                                    <div class="monsters"><span></span></div>
                                    <div class="spells"><span></span></div>
                                    <div class="traps"><span></span></div>
                                    <div class="extra_fusion"><span></span></div>
                                    <div class="extra_synchro"><span></span></div>
                                    <div class="extra_xyz"><span></span></div>
                                  </div>

                                  <div class="sideIn">
                                    <h4 class="head3In"><span></span>SIDE IN:</h4>
                                    <div class="monsters"><span></span></div>
                                    <div class="spells"><span></span></div>
                                    <div class="traps"><span></span></div>
                                    <div class="extra_fusion"><span></span></div>
                                    <div class="extra_synchro"><span></span></div>
                                    <div class="extra_xyz"><span></span></div>
                                  </div>
                                </div>
                              </div>

                              <div id="${userInputObject.asInput}goingSecond" class="tab-pane fade goingSecond">
                                <div class="inline-elements">
                                  <h4 id="deckSidingVs">Siding VS: ${userInputObject.asInput}</h4>
                                  <div class="inline-buttons">
                                    <div class="upperBtns">
                                      <button class="editTableNameBtn custom-margin">Edit Name</button>
                                      <button class="editTableBtn custom-margin">Edit Table</button>
                                    </div>
                                    <div class="lowerBtns">
                                      <button class="duplicateTableBtn custom-margin">Duplicate</button>
                                      <button class="deleteTableBtn custom-margin">Delete</button>
                                    </div>
                                  </div>
                                </div>

                                <div class="colonne">
                                  <div class="sideOut">
                                    <h4 class="head3Out"><span></span>SIDE OUT:</h4>
                                    <div class="monsters"><span></span></div>
                                    <div class="spells"><span></span></div>
                                    <div class="traps"><span></span></div>
                                    <div class="extra_fusion"><span></span></div>
                                    <div class="extra_synchro"><span></span></div>
                                    <div class="extra_xyz"><span></span></div>
                                  </div>

                                  <div class="sideIn">
                                    <h4 class="head3In"><span></span>SIDE IN:</h4>
                                    <div class="monsters"><span></span></div>
                                    <div class="spells"><span></span></div>
                                    <div class="traps"><span></span></div>
                                    <div class="extra_fusion"><span></span></div>
                                    <div class="extra_synchro"><span></span></div>
                                    <div class="extra_xyz"><span></span></div>
                                  </div>
                                </div>
                              </div>

                            </div>

                          </div>;`;

  // APPENDO TABELLA A CONTENITORE TABELLE
  divContenitoreTabelle.append(divTabella)
  let divTabellaId = divTabella.id;

  return divTabellaId;
}

function addEventListenerToCardDivs(divTabellaId) {

  arrSudDecksObj.forEach(subDeck => {

    console.log(subDeck);

    // recupero tutte le cardDiv da subDeckDiv
    let arrSubDeckCards = Array.from(subDeck.divElement.querySelectorAll(".cardDiv"))

    // aggiungo event listener a ogni cardDiv
    arrSubDeckCards.forEach(cardDiv => {
      cardDiv.addEventListener("click", () => {

        // scroll into view feature
        document.getElementById(divTabellaId).scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // RECUPERO TAB ATTIVA
        let activeTab = getActiveTab(divTabellaId);

        // RECUPERO ID TAB
        let tabContentId = activeTab.querySelector("a").getAttribute('href').slice(1);

        console.log("tab content id", tabContentId);
        //INSERISCO NOME CARD IN COLONNA TABELLA SE CLICKATA
        inseriscoCardinColonna(divTabellaId, tabContentId, subDeck.colonnaSide, cardDiv, subDeck.divElement)
      })
    })

  });

}

function inseriscoCardinColonna(divTabellaId, tabContentId, colonnaSide, cardDiv, subDeckDiv) {

  // RECUPERO NOME, TIPO di cardDiv
  let cardDivName = cardDiv.dataset.name;
  let cardDivType = cardDiv.dataset.type;

  // RECUPERO TABELLA e h4 colonnaSide
  let tabellaDiv = document.getElementById(divTabellaId)
  // let h4SpanSide = Number(tabellaDiv.querySelector("." + colonnaSide).querySelector("h4").querySelector("span").textContent);
  let h4SpanSide = Number(tabellaDiv.querySelector("#" + tabContentId).querySelector("." + colonnaSide).querySelector("h4").querySelector("span").innerHTML)

  if (h4SpanSide < QUANTITA_MAX_CARTE_SIDEABILI) {

    // SE DIV NOME CARTA CON DATA ATTRIBUTE == "cardName" MA senza greenBorder Class ESISTE, LA AGGIORNO
    if (tabellaDiv.querySelector("#" + tabContentId).querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`) && !cardDiv.classList.contains("greenBorder")) {

      console.log("nome carta tabella aggiornata");

      // aggiungo bordo alla carta
      cardDiv.classList.add("greenBorder")

      // recupero card span
      let cardSpan = Number(tabellaDiv.querySelector("#" + tabContentId).querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`).querySelector("span").innerHTML);
      console.log("log card span", cardSpan);

      if (cardSpan < QUANTITA_MAX_CARTA_SINGOLA) {
        // AGGIORNO SPAN HEADER
        tabellaDiv.querySelector("#" + tabContentId).querySelector("." + colonnaSide).querySelector("h4").querySelector("span").innerHTML = h4SpanSide + 1 + " ";
        // AGGIORNO SPAN CARD
        tabellaDiv.querySelector("#" + tabContentId).querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`).querySelector("span").innerHTML = cardSpan + 1 + " ";
      }
      // SE DIV NOME CARTA CON DATA ATTRIBUTE == "cardName" E con greenBorder Class ESISTE, LA AGGIORNO
    } else if (tabellaDiv.querySelector("#" + tabContentId).querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`) && cardDiv.classList.contains("greenBorder")) {

      console.log("hai già clickato questa carta");

    } else {// SE CARDnameDIV NON ESISTE LO CREO E INSERISCO

      console.log("nome carta tabella creata");

      // aggiungo bordo alla carta
      cardDiv.classList.add("greenBorder")

      // AGGIORNO SPAN HEADER
      tabellaDiv.querySelector("#" + tabContentId).querySelector("." + colonnaSide).querySelector("h4").querySelector("span").innerHTML = h4SpanSide + 1 + " ";

      // CREO DIV NOME CARTA
      let cardNameDiv = creoNomiPerTabella(cardDivName);

      // DIV TIPO DI CARTA (MONSTERS, SPELLS, TRAPS)
      let cardTypeDiv = assegnoTipoCartaADivTipo(cardDivType, cardNameDiv);

      // APPEND A CARD TYPE DIV DI TABELLA
      tabellaDiv.querySelector("#" + tabContentId).querySelector("." + colonnaSide).querySelector("." + cardTypeDiv).appendChild(cardNameDiv);

      // EVENT LISTENER
      cardNameDiv.addEventListener("click", () => {
        removeCard(tabellaDiv, tabContentId, colonnaSide, cardNameDiv, cardDivName, cardTypeDiv, subDeckDiv)
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
  let arrCardDivs = Array.from(tabellaDiv.querySelector("." + colonnaSide).querySelector("." + cardTypeDiv).querySelectorAll(".tableCard"));
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
        tabellaDiv.querySelector("." + colonnaSide).querySelector("." + cardTypeDiv).append(arrCardDivs[j]);
      }
    }
  }
}

function removeCard(tabellaDiv, tabContentId, colonnaSide, cardNameDiv, cardDivName, cardTypeDiv, subDeckDiv) {

  console.log("REMOVE CARD 1111");

  // recupero tutte le cardDiv da subDeckDiv
  let arrSubDeckCards = Array.from(subDeckDiv.querySelectorAll(".cardDiv"))

  for (let i = 0; i < arrSubDeckCards.length; i++) {
    if (arrSubDeckCards[i].classList.contains("greenBorder") && arrSubDeckCards[i].dataset.name == cardDivName) {
      arrSubDeckCards[i].classList.remove("greenBorder");
      break;
    }
  }

  // RECUPERO SPAN h4 colonnaSide
  let h4SpanSide = Number(tabellaDiv.querySelector("#" + tabContentId).querySelector("." + colonnaSide).querySelector("h4").querySelector("span").textContent);
  // RIDUCO DI 1 IL CONTATORE COLONNA
  tabellaDiv.querySelector("#" + tabContentId).querySelector("." + colonnaSide).querySelector("h4").querySelector("span").innerHTML = h4SpanSide - 1 + " ";
  // RECUPERO SPAN cardNameDiv
  let cardSpan = Number(cardNameDiv.querySelector("span").textContent);

  if (cardSpan > 1) {
    // RIDUCO DI 1 SPAN CARD
    tabellaDiv.querySelector("#" + tabContentId).querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`).querySelector("span").innerHTML = cardSpan - 1 + " ";
  } else {
    // RIMUOVO cardNameDiv
    tabellaDiv.querySelector("#" + tabContentId).querySelector("." + colonnaSide).querySelector("." + cardTypeDiv).removeChild(cardNameDiv);
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

  //! RECUPERO I 2 BTN
  let nodeListBtns = document.querySelector("#" + divTabellaId).querySelectorAll(".editTableNameBtn")
  nodeListBtns.forEach(btn => {
    btn.addEventListener("click", () => {

      console.log("you clicked the button");

      // recupero tabella con id
      let originalTable = document.getElementById(divTabellaId);

      // chiedo e controllo USER INPUT per nuovo nome e id tabella
      let userInputObject = controlloUserInputVsNomiTabelle(".tables");
      let userInputObjectNoSpaces = userInputObject.noSpaces;

      // clono tabella
      let clonedTable = originalTable.cloneNode(true);
      clonedTable.id = userInputObjectNoSpaces

      // SOSTITUISCO NEL DOM!
      originalTable.replaceWith(clonedTable)

      // RISCARICO IL DECK PER "RESETTARE" LE CARTE DAI VARI EVENT LISTENERS
      popoloSubdecks();

      // COLLEGGO EVENT LISTENER A TUTTE LE CARTE 
      addEventListenerToCardDivs(clonedTable.id);

      // ORDINO TABELLE IN ALFABETICO
      ordinoTabelleInAlfabetico();

      //! RECUPERO I content dei TABS
      let nodeListTabs = document.querySelector("#" + clonedTable.id).querySelectorAll('.nav-tabs li')
      nodeListTabs.forEach(tab => {

        let tabContentId = tab.querySelector("a").getAttribute('href').slice(1);

        // cambio testo h4 della tabella
        clonedTable.querySelector("#" + tabContentId).querySelector("h4").textContent = `Siding VS: ${userInputObject.asInput}`

        // COLLEGO EVENT LISTENERS AI BOTTONI della tabella di questo tab
        aggiungoEltoBtns(divTabellaId)

        tab.addEventListener("click", () => {
          removeGreenBorder();
          aggiungoGreenBorderACardDiv(clonedTable, tabContentId);
        })
        // attacco alle carte della vecchia tabella event listener per rimuoverle
        // COLLEGO EVENT LISTENER A TUTTI I NOMI NELLA TABELLA
        removeCardNameDivforCLonedTable(clonedTable, mainDeckDiv, "sideOut");
        removeCardNameDivforCLonedTable(clonedTable, sideDeckDiv, "sideIn");
        removeCardNameDivforCLonedTable(clonedTable, extraDeckDiv, "sideOut");
      })

    })
  });
}

// EDIT TABLE btn
function aggiungoEltoEditTableBtn(divTabellaId) {
  document.querySelector("#" + divTabellaId).querySelector(".editTableBtn").addEventListener("click", () => {

    console.log("HAI CLICKATO IL TASTO: editTableBtn");

    let currentTable = document.querySelector("#" + divTabellaId);

    // RIPOPOLO I DIV CON MAIN/SIDE/EXTRA in modo che gli event listener delle card si resettino dato che sto proprio creando nuovi Carddiv da zero)
    popoloSubdecks();

    // COLLEGGO EVENT LISTENER A TUTTE LE CARTE 
    addEventListenerToCardDivs(divTabellaId)

    // AGGIUNGO GREEN BORDER A CARTE GIA PRESENTI
    aggiungoGreenBorderACardDiv(currentTable, tabContentId)
  })
}

// DUPLICATE TABLE btn
function aggiungoEltoDuplicateTableBtn(divTabellaId) {

}

// DELETE TABLE btn
function aggiungoEltoDeleteTableBtn(divTabellaId) {

  // RECUPERO I DUE BTN
  let nodeListBtns = document.querySelector("#" + divTabellaId).querySelectorAll(".deleteTableBtn")
  nodeListBtns.forEach(btn => {
    // EVENT LISTENER TASTO DELETE
    btn.addEventListener("click", () => {

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
  })
}

// simile a removeCard, assegna event listener alle carte della tabella clonata per rimuoverle
function removeCardNameDivforCLonedTable(tabellaDiv, subDeckDiv, colonnaSide) {

  // recupero nomi dalla tabella clonata 
  let arrCardNameDivs = Array.from(tabellaDiv.querySelector("." + colonnaSide).querySelectorAll(".tableCard"));

  arrCardNameDivs.forEach(boxNome => {

    boxNome.addEventListener("click", () => {

      console.log("REMOVE CARD 222222");

      // RECUPERO SPAN h4 colonnaSide
      let h4SpanSide = Number(tabellaDiv.querySelector("." + colonnaSide).querySelector("h4").querySelector("span").textContent);

      // RECUPERO SPAN cardNameDiv
      let cardSpan = Number(boxNome.querySelector("span").textContent);

      //creo arrai di boxCarta dal subDeck
      let NodeListCardsinSubdeck = subDeckDiv.querySelectorAll(`[data-name="${boxNome.dataset.cardName}"]`);

      for (let j = 0; j < NodeListCardsinSubdeck.length; j++) {
        console.log("greenborder rimosso");
        if (subDeckDiv.contains(NodeListCardsinSubdeck[j]) && NodeListCardsinSubdeck[j].classList.contains("greenBorder")) {
          if (cardSpan > 1) {
            // RIDUCO DI 1 IL CONTATORE COLONNA
            tabellaDiv.querySelector("." + colonnaSide).querySelector("h4").querySelector("span").innerHTML = h4SpanSide - 1 + " ";
            // RIDUCO DI 1 SPAN CARD
            boxNome.querySelector("span").innerHTML = cardSpan - 1 + " ";
            NodeListCardsinSubdeck[j].classList.remove("greenBorder");
            break;
          } else {
            // RIDUCO DI 1 IL CONTATORE COLONNA
            tabellaDiv.querySelector("." + colonnaSide).querySelector("h4").querySelector("span").innerHTML = h4SpanSide - 1 + " ";
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

function aggiungoGreenBorderACardDiv(clonedTable, tabContentId) {

  arrSudDecksObj.forEach(subDeck => {

    // recupero nome e quantità carta presenti nella tabella clonata 
    let arrCardNameDivs = Array.from(clonedTable.querySelector("#" + tabContentId).querySelectorAll(".tableCard"))
      .map(element => {
        let name = element.dataset.cardName;
        let quantity = Number(element.querySelector("span").innerHTML);

        return {
          name: name,
          quantity: quantity
        };
      });

    // per ogni boxNome nella tabella
    for (let i = 0; i < arrCardNameDivs.length; i++) {

      //creo arrai di boxCarta dal subDeck
      let NodeListCardsinSubdeck = subDeck.divElement.querySelectorAll(`[data-name="${arrCardNameDivs[i].name}"]`);

      for (let j = 0; j < arrCardNameDivs[i].quantity; j++) {
        console.log("greenborder aggiunto");
        if (subDeck.divElement.contains(NodeListCardsinSubdeck[j]) && !NodeListCardsinSubdeck[j].classList.contains("greenBorder")) {
          NodeListCardsinSubdeck[j].classList.add("greenBorder");
        }
      }
    }
  });

}

function removeGreenBorder() {

  arrSudDecksObj.forEach(subDeck => {

    //creo arrai di boxCarta dal subDeck
    let NodeListCardsinSubdeck = subDeck.divElement.querySelectorAll(".cardDiv");

    for (let i = 0; i < NodeListCardsinSubdeck.length; i++) {
      console.log("greenborder rimosso");
      if (NodeListCardsinSubdeck[i].classList.contains("greenBorder")) {
        NodeListCardsinSubdeck[i].classList.remove("greenBorder");
      }
    }
  });

}

function getActiveTab(divTabellaId) {

  let activeTable = document.querySelector("#" + divTabellaId);

  // Recupero tabs di questa tabella
  var tabs = activeTable.querySelectorAll('.nav-tabs li');

  // ritorno il tab attivo
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains('active')) {
      return tabs[i];
    }
  }
}






