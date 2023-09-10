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
    if (DECKS[i].deckName == optionValue) {
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

  // CREO TABELLA
  const userInput = prompt("Insert the name of the deck you're siding against");
  const userInputWithoutSpaces = userInput.replace(/[^a-zA-Z0-9-_]/g, '');
  let divTabella = creaDivTabella(userInputWithoutSpaces);

  // APPENDO TABELLA A CONTENITORE TABELLE
  divContenitoreTabelle.append(divTabella)
  let divTabellaId = divTabella.id;

  // ORDINO TABELLE IN ALFABETICO
  ordinoTabelleInAlfabetico();

  // AGGIUNGO EL ALLE CARTE DI QUESTA TABELLA
  addEventListenerToCards(divTabellaId, mainDeckDiv, "sideOut", "main");
  addEventListenerToCards(divTabellaId, sideDeckDiv, "sideIn", "side");
  addEventListenerToCards(divTabellaId, extraDeckDiv, "sideIn", "extra");

  // EVENT LISTENER TASTO EDIT TABLE NAME
  document.querySelector(`.editTableNameBtn_${userInputWithoutSpaces}`).addEventListener("click", () => {
    console.log("clicked edit table name btn");
  })

  // EVENT LISTENER TASTO EDIT table
  document.querySelector(`.editTableBtn_${userInputWithoutSpaces}`).addEventListener("click", function () {
    // RIPOPOLO I DIV CON MAIN/SIDE/EXTRA in modo che gli event listener delle card si resettino dato che sto proprio creando nuovi Carddiv da zero)
    popoloSubdecks();
    // AGGIUNGO EL ALLE CARTE DI QUESTA TABELLA
    addEventListenerToCards(divTabellaId, mainDeckDiv, "sideOut", "main");
    addEventListenerToCards(divTabellaId, sideDeckDiv, "sideIn", "side");
    addEventListenerToCards(divTabellaId, extraDeckDiv, "sideIn", "extra");
  })

  // EVENT LISTENER TASTO DUPLICATE (da fixare, la tabella clonata non ha gli event listener)
  document.querySelector(`.duplicateTableBtn_${userInputWithoutSpaces}`).addEventListener("click", () => {
    let originalTable = document.getElementById(divTabellaId);
    let clonedTable = originalTable.cloneNode(true);
    // divContenitoreTabelle.appendChild(clonedTable);
    originalTable.parentElement.appendChild(clonedTable);
  })

  // EVENT LISTENER TASTO DELETE
  document.querySelector(`.deleteTableBtn_${userInputWithoutSpaces}`).addEventListener("click", () => {
    divContenitoreTabelle.removeChild(divTabella);
  })
})

// CANCELLO TUTTE LE TABELLE
deleteAllTablesBtn.addEventListener("click", () => {
  console.log("clicked delete all button");
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





//!FUNCTIONS LIST
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

function populateSubDeckDiv(matchedDeckObject, subDeckName, deckDiv) {
  // PULISCO DIV
  deckDiv.innerHTML = "";

  let subDeck = matchedDeckObject[subDeckName];

  if (subDeckName == "side" || subDeckName == "extra") {
    // POPOLO SIDE/EXTRA DIV CON IMG CARDS
    subDeck.forEach((card) => {
      // CREO CARD
      let cardDiv = document.createElement("div");
      cardDiv.setAttribute("class", "cardDiv");
      cardDiv.innerHTML = `<img src=${card.img} alt="">`;

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
          cardDiv.setAttribute("class", "cardDiv");
          cardDiv.innerHTML = `<img src=${mainDeck[j].img} alt="">`;

          // APPEND CARD
          divRiga.append(cardDiv);
        }
      } // fine loop j
      // 3. APPEND RIGA A MAINDECK DIV
      deckDiv.append(divRiga);
    } //fine loop i
  }
}

function addEventListenerToCards(divTabellaId, subDeckDiv, colonnaSide, subDeck) {
  // recupero tutte le cardDiv da subDeckDiv
  let arrSubDeckCards = Array.from(subDeckDiv.querySelectorAll(".cardDiv"))
  // aggiungo event listener a ogni cardDiv
  arrSubDeckCards.forEach(cardDiv => {
    cardDiv.addEventListener("click", function test() {
      cardDiv.classList.add("colorGreen");
      document.getElementById(divTabellaId).scrollIntoView({
        behavior: "smooth", // You can use "auto" for instant scrolling
        block: "start", // "start" will align the top of the table with the top of the viewport
      });
      let cardDivImgUrl = cardDiv.querySelector("img").getAttribute("src");
      inseriscoCardinColonna(divTabellaId, colonnaSide, subDeck, cardDivImgUrl, cardDiv)
    })
  })
}

function inseriscoCardinColonna(divTabellaId, colonnaSide, subDeck, cardDivImgUrl, cardDiv) {
  // RECUPERO MATCHED DECK DA LOCAL STORAGE
  let matchedDeck = JSON.parse(localStorage.getItem("matchedDeckObject"));
  let matchedDeckSubDeck = matchedDeck[subDeck];

  // RECUPERO TABELLA
  let tabellaDiv = document.getElementById(divTabellaId)
  console.log("test tabella div inner function", tabellaDiv);

  // RECUPERO SPAN H3 colonnaSide
  let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);

  // CARD INFO
  let cardName = "";
  let cardNameNoSpecialCharacters = "";
  let cardType = "";
  let cardQuantity = 0;
  for (let i = 0; i < matchedDeckSubDeck.length; i++) {
    if (cardDivImgUrl == matchedDeckSubDeck[i].img) {
      cardQuantity++
      cardName = matchedDeckSubDeck[i].name;
      cardNameNoSpecialCharacters = cardName.replace(/[^a-zA-Z0-9-_]/g, '');
      cardType = matchedDeckSubDeck[i].type;
    }
  }

  const QUANTITA_MAX_CARTE_SIDEABILI = 15;
  if (h3SpanSide < QUANTITA_MAX_CARTE_SIDEABILI) {
    // SE CARD DIV CON ID "cardName" ESISTE, LA AGGIORNO
    if (tabellaDiv.querySelector("." + cardNameNoSpecialCharacters)) {
      console.log("card aggiornata");
      let cardSpan = Number(tabellaDiv.querySelector("." + cardNameNoSpecialCharacters).querySelector("span").textContent)
      if (cardSpan < cardQuantity) {
        console.log("card aggiornata");
        // AGGIORNO SPAN HEADER
        tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide + 1 + " ";
        // AGGIORNO SPAN CARD
        tabellaDiv.querySelector("." + cardNameNoSpecialCharacters).querySelector("span").innerHTML = cardSpan + 1 + " ";
      }
    } else {// SE CARD DIV CON ID "cardNameNoSpecialCharacters" NON ESISTE LO CREO E INSERISCO
      console.log("card creata");
      // AGGIORNO SPAN HEADER
      tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide + 1 + " ";
      // CREO CARTA
      let cardNameDiv = document.createElement("div");
      cardNameDiv.setAttribute("class", cardNameNoSpecialCharacters)
      cardNameDiv.classList.add("tableCard");
      cardNameDiv.innerHTML = `<div class="nomiCarte"><button class="btnMinus">-</button><span>1 </span><p>${cardName}</p></div>`;
      // DIV TIPO DI CARTA (MONSTERS, SPELLS, TRAPS)
      let cardTypeDiv = "";
      if (cardType == "Effect Monster" || cardType == "Normal Monster" || cardType == "Tuner Monster" || cardType == "Ritual Monster") {
        cardTypeDiv = "monsters";
        cardNameDiv.classList.add("orangeBackground");
      } else if (cardType == "Spell Card") {
        cardTypeDiv = "spells";
        cardNameDiv.classList.add("greenBackground");
      } else if (cardType == "Trap Card") {
        cardTypeDiv = "traps";
        cardNameDiv.classList.add("purpleBackground")
      } else if (cardType == "Fusion Monster") {
        cardTypeDiv = "extra_fusion";
        cardNameDiv.classList.add("darkPurpleBackground")
      } else if (cardType == "Synchro Monster") {
        cardTypeDiv = "extra_synchro";
        cardNameDiv.classList.add("whiteBackground")
      } else if (cardType == "XYZ Monster") {
        cardTypeDiv = "extra_xyz";
        cardNameDiv.classList.add("blackBackground")
      }
      // APPEND A CARD TYPE DIV DI TABELLA
      tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).append(cardNameDiv);
      // EVENT LISTENER
      cardNameDiv.addEventListener("click", () => {
        removeCard(tabellaDiv, colonnaSide, cardNameDiv, cardNameNoSpecialCharacters, cardTypeDiv, cardDiv)
      });

      // ORDINO CARTE IN ORDINE ALFABETICO
      ordinaNomiCarteNellaTabella(tabellaDiv, colonnaSide, cardTypeDiv)
    }
  }
}

function ordinaNomiCarteNellaTabella(tabellaDiv, colonnaSide, cardTypeDiv) {
  // ORDINO CARTE IN ORDINE ALFABETICO (provare a mettere in funzione a parte)
  // RACCOLGO NOMI TABELLE
  let arrCardNames = [];

  // recupero tutte le carte e i loro nomi
  let arrCardDivs = Array.from(tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).querySelectorAll(".tableCard"));
  arrCardDivs.forEach(cardElement => {
    console.log(cardElement.querySelector("p").textContent);
    arrCardNames.push(cardElement.querySelector("p").textContent);
  });

  // sorto array di nomi
  arrCardNames.sort()
  console.log("test arrCardDivs", arrCardNames);
  // svuoto contenitore tabelle
  cardTypeDiv.innerHTML = "";

  // itero array nomi
  for (let i = 0; i < arrCardNames.length; i++) {
    console.log(arrCardNames[i]);
    // per ogni nome, cerco il suo divContenitoreTabelle e lo appendo divContenitoreTabelle
    for (let j = 0; j < arrCardDivs.length; j++) {
      if (arrCardNames[i] == arrCardDivs[j].querySelector("p").textContent) {
        tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).append(arrCardDivs[j]);
      }
    }
  }
}

function removeCard(tabellaDiv, colonnaSide, cardNameDiv, cardNameNoSpecialCharacters, cardTypeDiv, cardDiv) {
  // RECUPERO SPAN H3 colonnaSide
  let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);
  // RECUPERO SPAN cardNameDiv
  let cardSpan = Number(cardNameDiv.querySelector("span").textContent);

  // RIDUCO DI 1 IL CONTATORE COLONNA
  tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide - 1 + " ";
  cardDiv.classList.remove("colorGreen");

  if (cardSpan > 1) {
    // RIDUCO DI 1 SPAN CARD
    tabellaDiv.querySelector("." + cardNameNoSpecialCharacters).querySelector("span").innerHTML = cardSpan - 1 + " ";
  } else {
    // RIMUOVO CARD DIV
    tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).removeChild(cardNameDiv);
  }
}

function ordinoTabelleInAlfabetico() {
  // RACCOLGO NOMI TABELLE
  let arrTablesNames = [];

  // recupero tutte le tabelle e i loro nomi
  let arrTables = Array.from(divContenitoreTabelle.querySelectorAll(".tables"));
  console.log(arrTables);
  arrTables.forEach(table => {
    console.log(table.id);
    arrTablesNames.push(table.id)
  });

  // sorto array di nomi
  arrTablesNames.sort()
  console.log(arrTablesNames);
  // svuoto contenitore tabelle
  divContenitoreTabelle.innerHTML = "";

  // itero array nomi
  for (let i = 0; i < arrTablesNames.length; i++) {
    console.log(arrTablesNames[i]);
    // per ogni nome, cerco divTabella e la appendo divContenitoreTabelle
    for (let j = 0; j < arrTables.length; j++) {
      if (arrTablesNames[i] == arrTables[j].id) {
        divContenitoreTabelle.append(arrTables[j])
      }
    }
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

function creaDivTabella(userInputWithoutSpaces) {
  let divTabella = document.createElement("div");
  divTabella.setAttribute("class", "tables table")
  divTabella.setAttribute("id", userInputWithoutSpaces)
  divTabella.innerHTML = `
                            <div id="inline-elements">
                              <h2 id="deckSidingVs">Siding VS: ${userInputWithoutSpaces}</h2>
                              <div id="inline-buttons">
                                <button class="editTableNameBtn_${userInputWithoutSpaces} button">Edit Table Name</button>
                                <button class="editTableBtn_${userInputWithoutSpaces} button">Edit Table</button>
                                <button class="duplicateTableBtn_${userInputWithoutSpaces} button">Duplicate Table</button>
                                <button class="deleteTableBtn_${userInputWithoutSpaces} button">Delete Table</button>
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

  return divTabella;
}






