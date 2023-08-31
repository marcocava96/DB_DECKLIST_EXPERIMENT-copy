//! ELEMENTI HTML
const fileInput = document.getElementById("fileInput");
let uploadForm = document.getElementById("uploadForm");

//! UPLOAD DECK FILE (FORMATO YDK)
uploadForm.addEventListener("submit", function (event) {
  event.preventDefault();
  //RECUPERO PRIMO FILE DELLA FILES COLLECTION
  const file = fileInput.files[0];

  //CREO FILEREADER (object used to read the contents of the selected file asynchronously.)
  if (file) {
    const reader = new FileReader();
    // This sets up an event handler for the onload event of the FileReader.
    // The onload event is triggered when the file reading operation is completed successfully.
    reader.onload = async function (e) {
      const ydkDeck = e.target.result;
      // TRASFORMO YDK TO JSON
      let parsed = await parseYdkToJSON(ydkDeck, file.name);
      console.log("Parsed Deck:", parsed);
      // POSTO JSON SU DB
      await postToDb(parsed);
    };
    reader.readAsText(file);
  }
});

// 🤯(1st layer) FUNCTIONS
function postToDb(enrichedDeck) {
  // POSTO IL JSON NEL MIO DB
  fetch("http://localhost:3000/decks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(enrichedDeck),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// 🤯🤯(2nd layer) FUNCTIONS
function parseYdkToJSON(ydkDeck, fileName) {
  const YDK_DECK = ydkDeck.split("\n");

  // PULISCO YDK FILE
  YDK_DECK.shift();
  YDK_DECK.pop();

  // CREO OGGETTO PER JSON
  let newDeck = {
    id: "",
    deckName: fileName,
    main: [],
    side: [],
    extra: [],
  };

  let currentSection = "";
  // POPOLO FIELD DEL MIO OGGETTO CON CODICI CARTE DEL YDK FILE
  for (let i = 0; i < YDK_DECK.length; i++) {
    //PROBLEMA CON ID DI MONSTER REBORN
    if (YDK_DECK[i] === "83764718") {
      YDK_DECK[i] = "83764719";
    }
    if (
      YDK_DECK[i] === "#main" ||
      YDK_DECK[i] === "#extra" ||
      YDK_DECK[i] === "!side"
    ) {
      currentSection = YDK_DECK[i];
      console.log(currentSection);
      continue;
    }
    if (currentSection === "#main") {
      newDeck.main.push({ card_id: YDK_DECK[i] });
    } else if (currentSection === "#extra") {
      newDeck.extra.push({ card_id: YDK_DECK[i] });
    } else if (currentSection === "!side") {
      newDeck.side.push({ card_id: YDK_DECK[i] });
    }
  } //FINE LOOP

  // RECUPERO IMMAGINE, TIPO CARTA E DESCRIZIONE E LE AGGIUNGO AL NEWDECK
  let deck = enrichDeckFromApi(newDeck);
  return deck;
}

// 🤯🤯🤯(3rd layer) FUNCTIONS
function enrichDeckFromApi(newDeck) {
  // URL GENERCIO
  var url = "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=";
  // URL PER CHIAMATA UNICA DI TUTTE LE CARTE PRESENTI NEL MIO DECK
  url = createApiCallUrl(newDeck, url);

  // FETCH
  return fetch(url)
    .then((RESPONSE) => RESPONSE.json())
    .then((RESPONSE_JSON) => {
      const ALL_CARDS = RESPONSE_JSON.data;
      // POPOLO I MAIN, SIDE, EXTRA CON IMMAGINE, DESCRIZIONE E TIPO CARTA
      enrichSubDeck(newDeck, "main", ALL_CARDS);
      enrichSubDeck(newDeck, "side", ALL_CARDS);
      enrichSubDeck(newDeck, "extra", ALL_CARDS);
      return newDeck;
    })
    .catch((error) => {
      //GESTISCO EVENTUALI ERRORI
      console.error("Error:", error);
      throw error; // Rethrow the error to propagate it
    });
}

// 🤯🤯🤯🤯(4th layer) FUNCTIONS
function createApiCallUrl(newDeck, url) {
  newDeck.main.forEach((card) => {
    url += card.card_id + ",";
  });
  console.log(url.length);
  newDeck.side.forEach((card) => {
    url += card.card_id + ",";
  });
  console.log(url.length);
  newDeck.extra.forEach((card) => {
    url += card.card_id + ",";
  });
  console.log(url.length);

  return url;
}

function enrichSubDeck(newDeck, subdeck, ALL_CARDS) {
  newDeck[subdeck].forEach((card) => {
    for (let i = 0; i < ALL_CARDS.length; i++) {
      if (card.card_id == ALL_CARDS[i].id) {
        card.img = ALL_CARDS[i].card_images[0].image_url_small;
        card.type = ALL_CARDS[i].type;
        card.desc = ALL_CARDS[i].desc;
        card.name = ALL_CARDS[i].name;
        break;
      }
    } // fine loop
  }); // fine for each

  return newDeck;
}
