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