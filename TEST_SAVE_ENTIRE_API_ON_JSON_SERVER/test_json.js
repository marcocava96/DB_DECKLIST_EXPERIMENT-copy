////////////// FETCH GET ALL CARDS FROM YGOPRODECK API//////////////
fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php")
  .then((RESPONSE) => RESPONSE.json())
  .then((CARDS) => {
    console.log(CARDS);
    let allCards = [];

    for (let i = 0; i < CARDS.data.length; i++) {
      allCards.push(CARDS.data[i]);
    }

    makePostRequest(allCards);
  })
  .catch((error) => {
    // GESTISCO EVENTUALI ERRORI
    console.error("Error:", error);
  });

////////////// FETCH POST AL MIO DB CARDS//////////////
function makePostRequest(cardsArray) {
  for (let i = 0; i < 500; i++) {
    
    let newCard = {
      id: "",
      code: cardsArray[i].id,
      name: cardsArray[i].name,
      image: cardsArray[i].card_images[0].image_url_small,
    };

    fetch("http://localhost:3000/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCard),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("POST request successful:", result);
      })
      .catch((error) => {
        console.error("Error making POST request:", error);
      });
  }
}


