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
  populateSubDeckDiv(matchedDeckObject, "main", mainDeckDiv);
  populateSubDeckDiv(matchedDeckObject, "side", sideDeckDiv);
  populateSubDeckDiv(matchedDeckObject, "extra", extraDeckDiv);
});

//! CREO TABELLE PER SIDECKING
createSideBtn.addEventListener("click", () => {
  // PRENDO MATCHED DECK DALLA LOCAL STORAGE
  let currentDeck = JSON.parse(localStorage.getItem("matchedDeckObject"));

  // POPOLO I DIV CON MAIN/SIDE/EXTRA (in modo che gli event listener delle card si resettino)
  populateSubDeckDiv(currentDeck, "main", mainDeckDiv);
  populateSubDeckDiv(currentDeck, "side", sideDeckDiv);
  populateSubDeckDiv(currentDeck, "extra", extraDeckDiv);

  // CREO DIV TABELLA con ID UNICO BASED ON USER INPUT
  const userInput = prompt("Insert the name of the deck you're siding against");
  const userInputWithoutSpaces = userInput.replace(/[^a-zA-Z0-9-_]/g, '');

  let divTabella = document.createElement("div");
  divTabella.setAttribute("class", "tables")
  divTabella.setAttribute("id", userInputWithoutSpaces)
  divTabella.innerHTML = `
                          <button class="editTableBtn_${userInputWithoutSpaces}">Edit Table</button>
                          <button class="deleteTableBtn_${userInputWithoutSpaces}">Delete Table</button>
                          <h2 id="deckSidingVs">You are now siding against: ${userInputWithoutSpaces}</h2>
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
  let divTabellaId = divTabella.id;

  // ORDINO ALFABETICAMENTE
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
  divContenitoreTabelle.innerHTML = "";

  // itero array nomi
  for (let i = 0; i < arrTablesNames.length; i++) {
    console.log(arrTablesNames[i]);
    // per ogni nome, cerco il suo div e lo appendo
    for (let j = 0; j < arrTables.length; j++) {
      if (arrTablesNames[i] == arrTables[j].id) {
        divContenitoreTabelle.append(arrTables[j])
      }
    }
  }

  // AGGIUNGO EL ALLE CARTE DI QUESTA TABELLA
  addEventListenerToCards(divTabellaId, mainDeckDiv, "sideOut", "main");
  addEventListenerToCards(divTabellaId, sideDeckDiv, "sideIn", "side");
  addEventListenerToCards(divTabellaId, extraDeckDiv, "sideIn", "extra");

  // EVENT LISTENER TASTO EDIT
  document.querySelector(`.editTableBtn_${userInputWithoutSpaces}`).addEventListener("click", function () {
    // RISCARICO MATCHED DECK DALLA LOCAL STORAGE
    let currentDeck = JSON.parse(localStorage.getItem("matchedDeckObject"));
    console.log("sto RISCARICANDO il deck");
    // RIPOPOLO I DIV CON MAIN/SIDE/EXTRA
    populateSubDeckDiv(currentDeck, "main", mainDeckDiv);
    populateSubDeckDiv(currentDeck, "side", sideDeckDiv);
    populateSubDeckDiv(currentDeck, "extra", extraDeckDiv);
    // AGGIUNGO EL ALLE CARTE DI QUESTA TABELLA
    addEventListenerToCards(divTabellaId, mainDeckDiv, "sideOut", "main");
    addEventListenerToCards(divTabellaId, sideDeckDiv, "sideIn", "side");
    addEventListenerToCards(divTabellaId, extraDeckDiv, "sideIn", "extra");
  })

  // EVENT LISTENER TASTO DELETE
  document.querySelector(`.deleteTableBtn_${userInputWithoutSpaces}`).addEventListener("click", () => {
    divContenitoreTabelle.removeChild(divTabella);
  })
});

//! CANCELLO TUTTE LE TABELLE
deleteAllTablesBtn.addEventListener("click", () => {
  console.log("clicked delete all button");
  divContenitoreTabelle.innerHTML = "";
})

//! PRINT TABELLE (DA FIXARE)
generatePdfButton.addEventListener("click", () => {

  let element = divContenitoreTabelle;
  let opt = {
    margin: 0,
    filename: 'mySideDeck.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1, scrollY: 0 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // New Promise-based usage:
  html2pdf().set(opt).from(element).save();
})


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
      let cardDivImgUrl = cardDiv.querySelector("img").getAttribute("src");
      inseriscoCardinColonna(divTabellaId, colonnaSide, subDeck, cardDivImgUrl)
    })
  })
}

function inseriscoCardinColonna(divTabellaId, colonnaSide, subDeck, cardDivImgUrl) {
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
      let cardDiv = document.createElement("div");
      cardDiv.setAttribute("class", cardNameNoSpecialCharacters)
      cardDiv.innerHTML = `
                        <div class="tableCard">
                        <button class="btnMinus">-</button><p><span>1 </span>${cardName}</p>
                        </div>
                        `;
      // DIV TIPO DI CARTA (MONSTERS, SPELLS, TRAPS)
      let cardTypeDiv = "";
      if (cardType == "Effect Monster" ||
        cardType == "Normal Monster" ||
        cardType == "Tuner Monster" ||
        cardType == "Ritual Monster") {
        cardTypeDiv = "monsters";
      } else if (cardType == "Spell Card") {
        cardTypeDiv = "spells";
      } else {
        cardTypeDiv = "traps";
      }
      // APPEND A CARD TYPE DIV DI TABELLA
      tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).append(cardDiv);
      // EVENT LISTENER
      cardDiv.addEventListener("click", () => {
        removeCard(tabellaDiv, colonnaSide, cardDiv, cardNameNoSpecialCharacters, cardTypeDiv)
      });
    }
  }
}

function removeCard(tabellaDiv, colonnaSide, cardDiv, cardNameNoSpecialCharacters, cardTypeDiv) {
  // RECUPERO SPAN H3 colonnaSide
  let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);
  // RECUPERO SPAN cardDiv
  let cardSpan = Number(cardDiv.querySelector("span").textContent);

  // RIDUCO DI 1 IL CONTATORE COLONNA
  tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide - 1 + " ";

  if (cardSpan > 1) {
    // RIDUCO DI 1 SPAN CARD
    tabellaDiv.querySelector("." + cardNameNoSpecialCharacters).querySelector("span").innerHTML = cardSpan - 1 + " ";
  } else {
    // RIMUOVO CARD DIV
    tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).removeChild(cardDiv);
  }
}

// // NEED TO FIX IT
// function removeColorFrameFromCard(cardDiv) {
//   if (cardDiv.classList.contains("colorGreen")) {
//     cardDiv.classList.remove("colorGreen");
//   }
//   if (cardDiv.classList.contains("colorRed")) {
//     cardDiv.classList.remove("colorRed");
//   }
// }




























