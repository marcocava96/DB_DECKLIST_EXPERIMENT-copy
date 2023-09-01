//! FUNCTIONS
// 🤯(1st layer) FUNCTIONS
function populateDiv(matchedDeck, subDeckName, deckDiv) {

    // PULISCO DIV
    deckDiv.innerHTML = "";
  
    let subDeck = matchedDeck[subDeckName];
  
    if (subDeckName == "side" || subDeckName == "extra") {
      // POPOLO SIDE/EXTRA DIV CON IMG CARDS
      subDeck.forEach((card) => {
        // CREO CARD
        let cardDiv = document.createElement("div");
        cardDiv.setAttribute("class", "cardDiv");
        cardDiv.innerHTML = `<img src=${card.img} alt="">`;
  
        // AGGIUNGO ES ALLA CARD
        cardDiv.addEventListener("click", () => {
          //INSERISC0 CARD IN COLONNA sideIn
          insertCardIntoSideTable("sideIn", subDeck, card.name, card.type);
        });
  
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
              insertCardIntoSideTable("sideOut", subDeck, mainDeck[j].name, mainDeck[j].type);
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
  function insertCardIntoSideTable(idColonnaSide, subdeck, cardName, cardType) {
  
    const divTablesNodeList = document.querySelectorAll(".tables");
    console.log("test div tables", divTablesNodeList);
  
    const divTablesArr = Array.from(divTablesNodeList);
    console.log("test div arr", divTablesArr);
  
    let idTable = "";
  
    if (divTablesArr.length <= 1) {
      if (idColonnaSide == "sideOut") {
        idTable = divTablesArr[0];
        // INSERISCO CARD IN COLONNA
        inseriscoCardinColonna(idTable, idColonnaSide, subdeck, cardName, cardType, "head3Out");
      } else if (idColonnaSide == "sideIn") {
        // INSERISCO CARD IN COLONNA
        inseriscoCardinColonna(idTable, idColonnaSide, subdeck, cardName, cardType, "head3In");
      }
    } else {
      const userInput = prompt("Which table do you want to edit?");
      for (let i = 0; i < divTablesArr.length; i++) {
        if (userInput == divTablesArr[i]) {
          inseriscoCardinColonna(idTable, idColonnaSide, subdeck, cardName, cardType, "head3In");
        }
  
      }
    }
  }
  
  // 🤯🤯🤯(3rd layer) FUNCTIONS
  function inseriscoCardinColonna(idTable, idColonnaSide, subdeck, cardName, cardType, h3) {
    console.log("test cardType", cardName);
    console.log("test cardType", cardType);
    // COLONNA
    let colonnaSide = document.getElementById(idTable).idColonnaSide;
    // SPAN colonnaSide
    let h3SpanSide = Number(document.getElementById(h3).querySelector("span").textContent);
    let cardTypeDiv = "";
  
    // CARD QUANTITY
    let cardQuantity = 0;
    for (let i = 0; i < subdeck.length; i++) {
      if (cardName == subdeck[i].name) {
        cardQuantity++
      }
    }
  
    const QUANTITA_MAX_CARTE_SIDEABILI = 15;
    if (h3SpanSide < QUANTITA_MAX_CARTE_SIDEABILI) {
  
      // SE CARD DIV CON ID "cardName" ESISTE, LA AGGIORNO
      if (document.getElementById(cardName)) {
        let cardSpan = Number(document.getElementById(cardName).querySelector("span").textContent)
        if (cardSpan < cardQuantity) {
          console.log("card aggiornata");
          // AGGIORNO SPAN HEADER
          document.getElementById(h3).querySelector("span").innerHTML = h3SpanSide + 1 + " ";
          // AGGIORNO SPAN CARD
          document.getElementById(cardName).querySelector("span").innerHTML = cardSpan + 1;
        }
      } else {
        console.log("card creata");
        // AGGIORNO SPAN HEADER
        document.getElementById(h3).querySelector("span").innerHTML = h3SpanSide + 1 + " ";
        // SE CARD DIV CON ID "cardName" NON ESISTE LO CREO E INSERISCO
        let card = document.createElement("div");
        card.innerHTML = `
                        <div class="tableCard" id="${cardName}">
                        <button class="btnMinus">-</button>
                        <p><span>1</span>
                        ${cardName}</p>
                        </div>
                        `;
        // DIV TIPO DI CARTA (MONSTERS, SPELLS, TRAPS)
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
        // APPEND 
        colonnaSide.querySelector("#" + cardTypeDiv).append(card);
        // EVENT LISTENER
        card.addEventListener("click", () => {
          removeCard(colonnaSide, card, cardName, h3, cardTypeDiv);
        });
      }
  
  
    }
  }
  
  // 🤯🤯🤯🤯(4th layer) FUNCTIONS
  function removeCard(colonnaSide, card, cardName, h3, cardTypeDiv) {
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
      colonnaSide.querySelector("#" + cardTypeDiv).removeChild(card);
    }
  }