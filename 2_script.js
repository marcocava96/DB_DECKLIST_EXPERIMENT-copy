//!ELEMENTI HTML
let demo = document.querySelector("#demo");
let demo2 = document.querySelector("#demo2");
let decksSelect = document.querySelector("#decksSelect");
let createSide = document.querySelector("#createSide");
let mainDeckDiv = document.querySelector("#mainDeckDiv");
let sideDeckDiv = document.querySelector("#sideDeckDiv");
let extraDeckDiv = document.querySelector("#extraDeckDiv");

//! SELECT DINAMICA
decksSelect.addEventListener("click", () => {

  // FETCH DECKS SALVATI SU DB
  fetch("http://localhost:3000/decks")
    .then((RESPONSE) => RESPONSE.json())
    .then((DECKS) => {

      // ARR OF DECK NAMES
      let arrDecksNames = [];
      DECKS.forEach((deck) => {
        arrDecksNames.push(deck.deckName);
      });
      arrDecksNames.sort((a, b) => a.localeCompare(b));

      // ARR OF OPTIONS VALUES
      let optionsValues = [...decksSelect.options].map(
        (option) => option.value
      );

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
    }) // FINE FETCH DECKS
    .catch((error) => {
      //GESTISCO EVENTUALI ERRORI
      console.error("Error:", error);
    });
});

//! EVENT LISTENER OPTIONS FROM SELECT
decksSelect.addEventListener("change", () => {

  // PULISCO DIV
  demo2.innerHTML = "";

  // OPTION VALUE (== NOME DECK)
  let optionValue = event.target.value;

  // FETCH DECKS SALVATI SU DB
  fetch("http://localhost:3000/decks")
    .then((RESPONSE) => RESPONSE.json())
    .then((DECKS) => {

      console.log("You selected", optionValue);

      let matchedDeck = "";

      // GUARDA TUTTI I DECK
      for (let i = 0; i < DECKS.length; i++) {

        // SE OPTION è UGUALE A NOME DI UN DECK, PRENDI QUEL DECK
        console.log(DECKS[i]);
        if (DECKS[i].deckName == optionValue) {
          console.log("bau");
          matchedDeck = DECKS[i];
          break;
        }
      }

      console.log("Il deck matchato è ", matchedDeck);

      populateDiv(matchedDeck, "main", mainDeckDiv);
      populateDiv(matchedDeck, "side", sideDeckDiv);
      populateDiv(matchedDeck, "extra", extraDeckDiv);
    }) // FINE FETCH DECKS
    .catch((error) => {
      //GESTISCO EVENTUALI ERRORI
      console.error("Error:", error);
    });
});

//! CREO TABELLE PER SIDECKING
createSide.addEventListener("click", () => {
  //const userInput = prompt("Insert the name of the deck you're siding against");

  demo2.innerHTML += `
                    <h2 id="deckSidingVs">You are now siding against:</h2>
                    <div id="tables">

                      <div id="sideOut">
                        <h3 id="head3Out"><span></span>SIDE OUT:</h3>
                      </div>

                      <div id="sideIn">
                      <h3 id="head3In"><span></span>SIDE IN:</h3>
                      </div>
                    </div>
                    `;
});

// 🤯(1st layer) FUNCTIONS
function populateDiv(matchedDeck, subdeck, deckDiv) {

  // PULISCO DIV
  deckDiv.innerHTML = "";

  if (subdeck == "side" || subdeck == "extra") {
    // POPOLO SIDE/EXTRA DIV CON IMG CARDS
    matchedDeck[subdeck].forEach((card) => {

      // CREO CARD
      let cardDiv = document.createElement("div");
      cardDiv.setAttribute("class", "cardDiv");
      cardDiv.innerHTML = `<img src=${card.img} alt="">`;

      // AGGIUNGO ES ALLA CARD
      cardDiv.addEventListener("click", () => {
        //INSERISC0 CARD IN COLONNA sideIn
        insertCardIntoSideTable("sideIn", matchedDeck[subdeck], card.name, card.type);
      });

      // APPEND CARD
      deckDiv.append(cardDiv);
    });
  } else if (subdeck == "main") {
    // POPOLO MAIN DECK
    let mainDeck = matchedDeck[subdeck];
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
        console.log("sono counter", counter);
        if (j >= counter && j <= counter + 9) {
          // CREO CARD
          let card = document.createElement("div");
          card.setAttribute("class", "card");
          card.innerHTML = `
          <img src=${mainDeck[j].img} alt="">`;

          //AGGIUNGO EVENT LISTENER
          card.addEventListener("click", () => {
            //INSERISCI CARD IN COLONNA SIDE OUT SE CARTA APPARTIENE A MAIN
            insertCardIntoSideTable("sideOut", matchedDeck[subdeck], mainDeck[j].name, mainDeck[j].type);
          });

          // APPENDO CARD A DIV RIGA
          divRiga.append(card);
        }
      } // fine loop j
      // 3. APPEND RIGA A MAINDECK DIV
      deckDiv.append(divRiga);
    } //fine loop i
  }
}

// 🤯🤯(2nd layer) FUNCTIONS
function insertCardIntoSideTable(colonnaSide, matchedDecksubDeck, cardName, cardType) {

  if (colonnaSide == "sideOut") {
    // INSERISCO CARD IN COLONNA
    inseriscoCardinColonna(colonnaSide, matchedDecksubDeck, cardName, cardType, "head3Out");
  } else if (colonnaSide == "sideIn") {
    // INSERISCO CARD IN COLONNA
    inseriscoCardinColonna(colonnaSide, matchedDecksubDeck, cardName, cardType, "head3In");
  }
}

// 🤯🤯🤯(3rd layer) FUNCTIONS
function inseriscoCardinColonna(colonnaSide, matchedDecksubDeck, cardName, cardType, h3) {
  // SPAN SIDE
  let h3SpanSide = Number(document.getElementById(h3).querySelector("span").textContent);

  if (document.getElementById(cardName)) {
    console.log("card aggiornata");

    // AGGIORNO SPAN CARD
    let testoSpan = document.getElementById(cardName)
      .querySelector("span").textContent;
    console.log("test testo span", testoSpan);
    let testoSpanToNumber = Number(testoSpan);

    if (testoSpanToNumber < 3) {
      // AGGIORNO TESTO SPAN HEADER
      document.getElementById(h3).querySelector("span").innerHTML = h3SpanSide + 1 + " ";
      document.getElementById(cardName).innerHTML = `
                                                    <div class="tableCard" id="${cardName}">
                                                    <button class="btnMinus">-</button>
                                                    <p><span>${testoSpanToNumber + 1}</span>
                                                    ${cardName}</p>
                                                    </div>
                                                    `;
    }
  } else {
    // CREO TESTO SPAN HEADER
    document.getElementById(h3).querySelector("span").innerHTML += 1 + " ";
    // SE CARD DIV CON ID "cardName" NON ESISTE LO CREO E INSERISCO
    let card = document.createElement("div");
    card.innerHTML = `
                      <div class="tableCard" id="${cardName}">
                      <button class="btnMinus">-</button>
                      <p><span>1</span>
                      ${cardName}</p>
                      </div>
                      `;
    card.addEventListener("click", () => {
      removeCard(colonnaSide, card, cardName, h3);
    });
    colonnaSide.append(card);
  }
}

// 🤯🤯🤯🤯(4th layer) FUNCTIONS
function removeCard(colonna, card, cardName, h3) {
  let cardSpan = Number(card.querySelector("span").textContent);
  let h3Span = Number(document.getElementById(h3).querySelector("span").textContent);

  document.getElementById(h3).querySelector("span").innerHTML = h3Span - 1 + " ";

  console.log(cardSpan);

  if (cardSpan > 1) {
    card.innerHTML = `
                      <div class="tableCard" id="${cardName}">
                      <button class="btnMinus">-</button>
                      <p><span>${cardSpan - 1}</span>
                      ${cardName}</p>
                      </div>
                    `;
  } else {
    colonna.removeChild(card);
  }
}
