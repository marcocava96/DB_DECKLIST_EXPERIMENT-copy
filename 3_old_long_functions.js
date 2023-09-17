function inseriscoCardinColonna(divTabellaId, colonnaSide, cardDiv, subDeckDiv) {

  console.log("TEST CARD DIV", cardDiv);

  // RECUPERO NOME, TIPO di cardDiv
  let cardDivName = cardDiv.dataset.name;
  let cardDivType = cardDiv.dataset.type;

  // RECUPERO TABELLA e H3 colonnaSide
  let tabellaDiv = document.getElementById(divTabellaId)
  let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);

  // RECUPERO TUTTI I CARDDIV DA COLONNA TABELLA
  let arrCardNameDivsFromColonnaofTable = Array.from(tabellaDiv.querySelectorAll(".cardNameDiv"));

  arrCardNameDivsFromColonnaofTable.forEach(cardDiv => {
    if (cardDiv.dataset.name == cardDivName){
      console.log("trovato match");
    }
  });


  if (h3SpanSide < QUANTITA_MAX_CARTE_SIDEABILI) {

    // SE DIV NOME CARTA CON DATA ATTRIBUTE == "cardName" MA senza greenBorder Class ESISTE, LA AGGIORNO
    if (tabellaDiv.querySelector(`.cardNameDiv[data-card-name="${cardDivName}"]`) && !cardDiv.classList.contains("greenBorder")) {

      console.log("nome carta tabella aggiornata");

      // aggiungo bordo alla carta
      cardDiv.classList.add("greenBorder")

      let cardSpan = Number(tabellaDiv.querySelector(".cardNameDiv").querySelector("span").innerHTML)

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
      let cardNameDiv = creoDivNomeCarta(cardDivName);

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

function creoDivNomeCarta(cardDivName) {
  // CREO DIV NOME CARTA
  let cardNameDiv = document.createElement("div");
  // cardNameDiv.setAttribute("id", cardDiv.id)
  cardNameDiv.dataset.cardName = cardDivName;
  cardNameDiv.setAttribute("class", "tableCard");
  cardNameDiv.classList.add("cardNameDiv");
  cardNameDiv.innerHTML = `<div class="nomiCarte"><button class="btnMinus">-</button><span>1 </span><p>${cardDivName}</p></div>`;

  return cardNameDiv;
}
