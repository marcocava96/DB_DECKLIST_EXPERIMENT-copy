// simile a removeCard, assegna event listener alle carte della tabella clonata per rimuoverle
function removeCardNameDivforCLonedTable(tabellaDiv, subDeckDiv, colonnaSide) {

  // recupero nomi dalla tabella clonata 
  let arrCardNameDivs = Array.from(tabellaDiv.querySelector("#" + colonnaSide).querySelectorAll(".tableCard"));

  arrCardNameDivs.forEach(boxNome => {

    boxNome.addEventListener("click", () => {

      console.log("REMOVE CARD 222222");
      console.log(boxNome);

      // RECUPERO SPAN H3 colonnaSide
      let h3SpanSide = Number(tabellaDiv.querySelector("#" + colonnaSide).querySelector("h3").querySelector("span").textContent);

      // RECUPERO SPAN cardNameDiv
      let cardSpan = Number(boxNome.querySelector("span").textContent);

      //creo arrai di boxCarta dal subDeck
      let NodeListCardsinSubdeck = subDeckDiv.querySelectorAll(`[data-name="${boxNome.dataset.cardName}"]`);

      for (let j = 0; j < NodeListCardsinSubdeck.length; j++) {
        console.log("greenborder aggiunto");
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