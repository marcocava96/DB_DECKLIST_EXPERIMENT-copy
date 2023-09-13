function creaDivTabella() {
  const userInput = prompt("Insert the name of the deck you're siding against");
  const userInputWithoutSpaces = userInput.replace(/[^a-zA-Z0-9-_]/g, '');

  let divTabella = document.createElement("div");
  divTabella.setAttribute("class", "tables table")
  divTabella.setAttribute("id", userInputWithoutSpaces)
  divTabella.innerHTML = `
                              <div id="inline-elements">
                                <h2 id="deckSidingVs">Siding VS: ${userInputWithoutSpaces}</h2>
                                <div id="inline-buttons">
                                  <button class="editTableNameBtn">Edit Table Name</button>
                                  <button class="editTableBtn">Edit Table</button>
                                  <button class="duplicateTableBtn">Duplicate Table</button>
                                  <button class="deleteTableBtn">Delete Table</button>
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

  // APPENDO TABELLA A CONTENITORE TABELLE
  divContenitoreTabelle.append(divTabella)
  let divTabellaId = divTabella.id;

  // AGGIUNGO EL ALLE CARTE DI QUESTA TABELLA
  addEventListenerToCards(divTabellaId, mainDeckDiv, "sideOut", "main");
  addEventListenerToCards(divTabellaId, sideDeckDiv, "sideIn", "side");
  addEventListenerToCards(divTabellaId, extraDeckDiv, "sideOut", "extra");

  // AGGIUNGTO EVENT LISTENERS AI BOTTONI
  aggiungoEltoBtns(divTabellaId)
}


function aggiungoEltoEditTableNameBtn(divTabellaId) {

  document.querySelector("#" + divTabellaId).querySelector(".editTableNameBtn").addEventListener("click", () => {

    popoloSubdecks();

    // Remove the event listener temporarily
    document.querySelector("#" + divTabellaId).removeEventListener("click", aggiungoEltoBtns);
    // DEVO CONTROLLARE CHE IL NUOVO NOME NON MATCHI QUELLO DI UN'ALTRA TABELLA
    // RACCOLGO NOMI TABELLE
    let arrTablesNames = [];

    // recupero tutte le tabelle e i loro nomi
    let arrTables = Array.from(divContenitoreTabelle.querySelectorAll(".tables"));
    arrTables.forEach(table => {
      arrTablesNames.push(table.id)
    });

    console.log("HAI CLICKATO IL TASTO: editTableNameBtn");
    console.log("TEST SARR TABLES", arrTablesNames);

    // NEW TABLE NAME FROM USER INPUT
    let userInput = prompt("edit your name here");
    let userInputWithoutSpaces = userInput.replace(/[^a-zA-Z0-9-_]/g, '');

    if (arrTablesNames.includes(userInputWithoutSpaces)) {
      alert("Esiste già una tabella con questo nome!");
      return;
    } else {
      alert("Nuovo nome accettato!");

      // Remove existing event listeners (assuming it's a click event)
      document.querySelector("#" + divTabellaId).removeEventListener("click", aggiungoEltoBtns);

      let renamedTable = document.querySelector("#" + divTabellaId);

      // AGGIORNO ID TABLE
      renamedTable.setAttribute("id", userInputWithoutSpaces);
      let renamedTableId = renamedTable.id;
      console.log("test id tabella AGGIORNATO", renamedTableId);

      // AGGIORNO TESTO H2
      renamedTable.querySelector("h2").textContent = `Siding VS: ${userInput}`;

      // RICOLLEGO EVENT LISTENERS 
      aggiungoEltoBtns(renamedTableId)

      // RIPOPOLO I DIV CON MAIN/SIDE/EXTRA in modo che gli event listener delle card si resettino dato che sto proprio creando nuovi Carddiv da zero)
      popoloSubdecks();

      // AGGIUNGO EL ALLE CARTE DI QUESTA TABELLA
      addEventListenerToCards(renamedTableId, mainDeckDiv, "sideOut", "main");
      addEventListenerToCards(renamedTableId, sideDeckDiv, "sideIn", "side");
      addEventListenerToCards(renamedTableId, extraDeckDiv, "sideIn", "extra");

      console.log("MOSTRA TABELLA RINOMINATA", renamedTable);
      console.log("MOSTRA ID TABELLA RINOMINATA", renamedTable.id);

      return;
    }
  })
}

function aggiungoEltoDuplicateTableBtn(divTabellaId) {
  document.querySelector("#" + divTabellaId).querySelector(".duplicateTableBtn").addEventListener("click", () => {

    // popoloSubdecks();

    // Remove the event listener 
    document.querySelector("#" + divTabellaId).removeEventListener("click", aggiungoEltoBtns);

    // DEVO CONTROLLARE CHE IL NUOVO NOME NON MATCHI QUELLO DI UN'ALTRA TABELLA
    // RACCOLGO NOMI TABELLE
    let arrTablesNames = [];
    // recupero tutte le tabelle e i loro nomi
    let arrTables = Array.from(divContenitoreTabelle.querySelectorAll(".tables"));
    arrTables.forEach(table => {
      arrTablesNames.push(table.id)
    });

    const userInput = prompt("Insert the name of the deck you're siding against");
    const userInputWithoutSpaces = userInput.replace(/[^a-zA-Z0-9-_]/g, '');

    if (arrTablesNames.includes(userInputWithoutSpaces)) {
      alert("Esiste già una tabella con questo nome!");
      return;
    } else {

      // Select the original element with an event listener
      const originalTable = document.querySelector("#" + divTabellaId);

      // Clone the element
      const clonedTable = originalTable.cloneNode(true);

      // Remove existing event listeners (assuming it's a click event)
      clonedTable.removeEventListener("click", aggiungoEltoBtns);

      // change id of cloned Tables
      clonedTable.setAttribute("id", userInputWithoutSpaces)
      let clonedTableId = clonedTable.id;

      // AGGIUNGO EL ALLE CARTE DI QUESTA TABELLA
      addEventListenerToCards(clonedTableId, mainDeckDiv, "sideOut", "main");
      addEventListenerToCards(clonedTableId, sideDeckDiv, "sideIn", "side");
      addEventListenerToCards(clonedTableId, extraDeckDiv, "sideOut", "extra");

      // AGGIUNGTO EVENT LISTENERS AI BOTTONI
      aggiungoEltoBtns(clonedTableId)

      // Append the cloned element to the DOM
      divContenitoreTabelle.appendChild(clonedTable);

      // AGGIORNO TESTO H2
      clonedTable.querySelector("h2").textContent = `Siding VS: ${userInput}`;

      //ordina alfabeticamente
      ordinoTabelleInAlfabetico();
    }
  })
}

  document.querySelector("#" + divTabellaId).querySelector(".editTableNameBtn").addEventListener("click", () => {
    // Remove the event listener temporarily
    document.querySelector("#" + divTabellaId).removeEventListener("click", aggiungoEltoBtns);
    // DEVO CONTROLLARE CHE IL NUOVO NOME NON MATCHI QUELLO DI UN'ALTRA TABELLA
    // RACCOLGO NOMI TABELLE
    let arrTablesNames = [];

    // recupero tutte le tabelle e i loro nomi
    let arrTables = Array.from(divContenitoreTabelle.querySelectorAll(".tables"));
    arrTables.forEach(table => {
      arrTablesNames.push(table.id)
    });

    console.log("HAI CLICKATO IL TASTO: editTableNameBtn");
    console.log("TEST SARR TABLES", arrTablesNames);

    // NEW TABLE NAME FROM USER INPUT
    let userInput = prompt("edit your name here");
    let userInputWithoutSpaces = userInput.replace(/[^a-zA-Z0-9-_]/g, '');

    if (arrTablesNames.includes(userInputWithoutSpaces)) {
      alert("Esiste già una tabella con questo nome!");
      return;
    } else {
      alert("Nuovo nome accettato!");

      // Remove existing event listeners (assuming it's a click event)
      document.querySelector("#" + divTabellaId).removeEventListener("click", aggiungoEltoBtns);

      let renamedTable = document.querySelector("#" + divTabellaId);

      // AGGIORNO ID TABLE
      renamedTable.setAttribute("id", userInputWithoutSpaces);
      let renamedTableId = renamedTable.id;
      console.log("test id tabella AGGIORNATO", renamedTableId);

      // AGGIORNO TESTO H2
      renamedTable.querySelector("h2").textContent = `Siding VS: ${userInput}`;



      // RICOLLEGO EVENT LISTENERS 
      aggiungoEltoBtns(renamedTableId)

      // RIPOPOLO I DIV CON MAIN/SIDE/EXTRA in modo che gli event listener delle card si resettino dato che sto proprio creando nuovi Carddiv da zero)
      popoloSubdecks();

      // AGGIUNGO EL ALLE CARTE DI QUESTA TABELLA
      addEventListenerToCards(renamedTableId, mainDeckDiv, "sideOut", "main");
      addEventListenerToCards(renamedTableId, sideDeckDiv, "sideIn", "side");
      addEventListenerToCards(renamedTableId, extraDeckDiv, "sideIn", "extra");
