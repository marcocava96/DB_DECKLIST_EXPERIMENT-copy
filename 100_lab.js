// EDIT TABLE NAME btn
function aggiungoEltoEditTableNameBtn(divTabellaId) {

    //! RECUPERO I 2 BTN
    let nodeListBtns = document.querySelector("#" + divTabellaId).querySelectorAll(".editTableNameBtn")
    nodeListBtns.forEach(btn => {
        btn.addEventListener("click", () => {

            // recupero tabella con id
            let originalTable = document.getElementById(divTabellaId);

            // chiedo e controllo USER INPUT per nuovo nome e id tabella
            let userInputObject = controlloUserInputVsNomiTabelle(".tables");
            let userInputObjectNoSpaces = userInputObject.noSpaces;

            // clono tabella
            let clonedTable = originalTable.cloneNode(true);
            clonedTable.id = userInputObjectNoSpaces

            // SOSTITUISCO NEL DOM!
            originalTable.replaceWith(clonedTable)

            //! RECUPERO I TABS
            let nodeListTabs = document.querySelector("#" + divTabellaId).querySelectorAll('.nav-tabs li')
            nodeListTabs.forEach(tab => {

                let tabContentId = tab.querySelector("a").getAttribute('href').slice(1);

                // cambio testo h4 della tabella
                clonedTable.querySelector("#" + tabContentId).querySelector("h4").textContent = `Siding VS: ${userInputObject.asInput}`

                // COLLEGO EVENT LISTENERS AI BOTTONI
                aggiungoEltoBtns(clonedTable.id, tabContentId)
            })

            // RISCARICO IL DECK PER "RESETTARE" LE CARTE DAI VARI EVENT LISTENERS
            popoloSubdecks();

            // COLLEGGO EVENT LISTENER A TUTTE LE CARTE 
            addEventListenerToCardDivs(clonedTable.id)

            // AGGIUNGO GREEN BORDER A CARTE GIA PRESENTI
            aggiungoGreenBorderACardDiv(clonedTable, tabContentId)

            // attacco alle carte della vecchia tabella event listener per rimuoverle
            // COLLEGO EVENT LISTENER A TUTTI I NOMI NELLA TABELLA
            removeCardNameDivforCLonedTable(clonedTable, mainDeckDiv, "sideOut");
            removeCardNameDivforCLonedTable(clonedTable, sideDeckDiv, "sideIn");
            removeCardNameDivforCLonedTable(clonedTable, extraDeckDiv, "sideOut");

            // ORDINO TABELLE IN ALFABETICO
            ordinoTabelleInAlfabetico();
        })
    });
}