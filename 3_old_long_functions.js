// new features

// EVENT LISTENER DUPLICATE TABLE
document.querySelector(`.duplicateTableBtn_${userInputWithoutSpaces}`).addEventListener("click", () => {
  console.log("test div tabella", divTabella);
  const userInput = prompt("You are duplicating the current table. Please insert the name of the deck you're siding against");
  const userInputWithoutSpaces = userInput.replace(/[^a-zA-Z0-9-_]/g, '');
  var cloneTabella = divTabella.cloneNode(true);
  cloneTabella.setAttribute("id", userInputWithoutSpaces);
  cloneTabella.querySelector("h2").textContent = `Siding VS: ${userInputWithoutSpaces}`
  divContenitoreTabelle.appendChild(cloneTabella);
})

function creaDivTabella(userInputWithoutSpaces) {
  let divTabella = document.createElement("div");
  divTabella.setAttribute("class", "tables table")
  divTabella.setAttribute("id", userInputWithoutSpaces)
  divTabella.innerHTML = `
                            <div id="inline-elements">
                              <h2 id="deckSidingVs">Siding VS: ${userInputWithoutSpaces}</h2>
                              <div id="inline-buttons">
                                <button class="editTableNameBtn_${userInputWithoutSpaces} button">Edit Table Name</button>
                                <button class="editTableBtn_${userInputWithoutSpaces} button">Edit Table</button>
                                <button class="duplicateTableBtn_${userInputWithoutSpaces} button">Duplicate Table</button>
                                <button class="deleteTableBtn_${userInputWithoutSpaces} button">Delete Table</button>
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

  return divTabella;
}