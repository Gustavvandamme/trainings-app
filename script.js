const formular = document.getElementById("eintrag-formular");
const liste = document.getElementById("liste");
const SPEICHER_NAME = "trainingsEintraege";
// Heutiges Datum vorausfüllen
document.getElementById("datum").valueAsDate = new Date();
function ladeEintraege() {
  return JSON.parse(localStorage.getItem(SPEICHER_NAME)) || [];
}
function speichereEintraege(eintraege) {
  localStorage.setItem(SPEICHER_NAME, JSON.stringify(eintraege));
}
function zeigeEintraege() {
  const eintraege = ladeEintraege();
  eintraege.sort((a, b) => b.datum.localeCompare(a.datum));
  liste.innerHTML = "";
  eintraege.forEach((eintrag) => {
    const zeile = document.createElement("li");
    const datum = new Date(eintrag.datum).toLocaleDateString("de-DE");
    zeile.textContent = datum + " – " + eintrag.uebung + ": " + eintrag.gewicht + " kg";
    const loeschen = document.createElement("button");
    loeschen.textContent = "×";
    loeschen.addEventListener("click", () => {
      const rest = ladeEintraege().filter((e) => e.id !== eintrag.id);
      speichereEintraege(rest);
      zeigeEintraege();
    });
    zeile.appendChild(loeschen);
    liste.appendChild(zeile);
  });
}
formular.addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();
  const eintraege = ladeEintraege();
  eintraege.push({
    id: Date.now(),
    uebung: document.getElementById("uebung").value,
    gewicht: document.getElementById("gewicht").value,
    datum: document.getElementById("datum").value
  });
  speichereEintraege(eintraege);
  formular.reset();
  document.getElementById("datum").valueAsDate = new Date();
  zeigeEintraege();
});
zeigeEintraege();