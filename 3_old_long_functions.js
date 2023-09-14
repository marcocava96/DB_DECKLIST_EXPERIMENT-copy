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

      cardDiv.dataset.name = card.name;
      cardDiv.dataset.name = card.type;

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
          cardDiv.dataset.name = mainDeck[j].name;
          cardDiv.dataset.name = mainDeck[j].type;

          // APPEND CARD
          divRiga.append(cardDiv);
        }
      } // fine loop j
      // 3. APPEND RIGA A MAINDECK DIV
      deckDiv.append(divRiga);
    } //fine loop i
  }
}





function addEventListenerToCardDivs(divTabellaId, subDeckDiv, colonnaSide, subDeck) {

  // recupero tutte le cardDiv da subDeckDiv
  let arrSubDeckCards = Array.from(subDeckDiv.querySelectorAll(".cardDiv"))

  // aggiungo event listener a ogni cardDiv
  arrSubDeckCards.forEach(cardDiv => {
    cardDiv.addEventListener("click", () => {

      // aggiungo bordo dalla carta
      cardDiv.classList.add("greenBorder")

      // scroll into view feature
      document.getElementById(divTabellaId).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      //FUNZIONE CHE PARTE AL CLICK
      inseriscoCardinColonna(divTabellaId, colonnaSide, subDeck, cardDiv)
    })
  })
}

function inseriscoCardinColonna(divTabellaId, colonnaSide, cardDiv) {

  // RECUPERO NOME, TIPO di cardDiv
  let cardDivName = cardDiv.dataset.name;
  console.log("log card Div name dataset", cardDivName);
  let cardDivType = cardDiv.dataset.type;
  console.log("log card Div type dataset", cardDivType);

  // RECUPERO TABELLA
  let tabellaDiv = document.getElementById(divTabellaId)

  // RECUPERO SPAN H3 colonnaSide di tabellaDiv
  let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);

  const QUANTITA_MAX_CARTE_SIDEABILI = 15;
  if (h3SpanSide < QUANTITA_MAX_CARTE_SIDEABILI) {

    // SE DIV NOME CARTA CON DATA ATTRIBUTE == "cardName" ESISTE, LA AGGIORNO
    if (tabellaDiv.querySelector("." + cardInfoObject.nameNoSpecialCharacters)) {
      console.log("card aggiornata");
      let cardSpan = Number(tabellaDiv.querySelector("." + cardInfoObject.nameNoSpecialCharacters).querySelector("span").textContent)
      if (cardSpan < cardInfoObject.quantity) {
        console.log("card aggiornata");
        // AGGIORNO SPAN HEADER
        tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide + 1 + " ";
        // AGGIORNO SPAN CARD
        tabellaDiv.querySelector("." + cardInfoObject.nameNoSpecialCharacters).querySelector("span").innerHTML = cardSpan + 1 + " ";
      }
    } else {// SE CARD DIV CON CON DATA ATTRIBUTE == "cardName" NON ESISTE LO CREO E INSERISCO

      console.log("card creata");

      // AGGIORNO SPAN HEADER
      tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide + 1 + " ";

      // CREO DIV NOME CARTA
      let cardNameDiv = document.createElement("div");
      cardNameDiv.dataset.cardName = cardDivName
      cardNameDiv.classList.add("tableCard");
      cardNameDiv.classList.add("cardNameDiv");
      cardNameDiv.innerHTML = `<div class="nomiCarte"><button class="btnMinus">-</button><span>1 </span><p>${cardDivName}</p></div>`;

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

      // APPEND A CARD TYPE DIV DI TABELLA
      tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).append(cardNameDiv);

      // EVENT LISTENER
      cardNameDiv.addEventListener("click", () => {
        removeCard(tabellaDiv, colonnaSide, cardNameDiv, cardInfoObject.nameNoSpecialCharacters, cardTypeDiv, cardDiv, cardDivName)
      });

      // ORDINO DIV NOMI CARTE IN ORDINE ALFABETICO
      ordinaNomiCarteNellaTabella(tabellaDiv, colonnaSide, cardTypeDiv)
    }
  }
}




function removeCard(tabellaDiv, colonnaSide, cardNameDiv, cardDiv) {
  // RECUPERO SPAN H3 colonnaSide
  let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);
  // RECUPERO SPAN cardNameDiv
  let cardSpan = Number(cardNameDiv.querySelector("span").textContent);

  // rimuovo bordo da cardDiv
  cardDiv.classList.remove("greenBorder");

  // RIDUCO DI 1 IL CONTATORE COLONNA
  tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").innerHTML = h3SpanSide - 1 + " ";

  if (cardSpan > 1) {
    // RIDUCO DI 1 SPAN CARD
    tabellaDiv.querySelector("." + cardNameNoSpecialCharacters).querySelector("span").innerHTML = cardSpan - 1 + " ";
  } else {
    // RIMUOVO cardNameDiv
    tabellaDiv.querySelector("#" + colonnaSide).querySelector("#" + cardTypeDiv).removeChild(cardNameDiv);
  }
}