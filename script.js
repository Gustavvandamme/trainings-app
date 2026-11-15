// ---------- Navigation ----------
function zeigeSeite(id) {
  document.querySelectorAll(".seite").forEach((s) => s.classList.remove("aktiv"));
  document.getElementById(id).classList.add("aktiv");
  if (id === "start") zeigeHero();
  if (id === "anpassen") fuelleAnpAuswahl();
  if (id === "planen") zeigePlanen();
  if (id === "fortschritt") zeigeFortschritt();
  if (id === "starten" && !laufendesTraining) zeigeStartAuswahl();
  if (id === "neu") fuelleUebungen();
  window.scrollTo(0, 0);
}

document.querySelectorAll(".kachel").forEach((kachel) => {
  kachel.addEventListener("click", () => zeigeSeite(kachel.dataset.ziel));
});

document.querySelectorAll(".zurueck").forEach((knopf) => {
  knopf.addEventListener("click", () => zeigeSeite("start"));
});

// ---------- Profil ----------
const PROFIL_NAME = "trainingsProfil";

function ladeProfil() {
  return JSON.parse(localStorage.getItem(PROFIL_NAME)) || {};
}

function zeigeProfil() {
  const profil = ladeProfil();
  document.getElementById("alter").value = profil.alter || "";
  document.getElementById("koerpergewicht").value = profil.gewicht || "";
  document.getElementById("groesse").value = profil.groesse || "";

  const info = document.getElementById("profil-info");
  if (profil.gewicht && profil.groesse) {
    const meter = profil.groesse / 100;
    const bmi = (profil.gewicht / (meter * meter)).toFixed(1);
    info.textContent = "Dein BMI: " + bmi;
  } else {
    info.textContent = "";
  }
}

document.getElementById("profil-formular").addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();
  const profil = {
    alter: document.getElementById("alter").value,
    gewicht: document.getElementById("koerpergewicht").value,
    groesse: document.getElementById("groesse").value
  };
  localStorage.setItem(PROFIL_NAME, JSON.stringify(profil));
  zeigeProfil();
  alert("Profil gespeichert");
});

// ---------- Übungsliste ----------
const UEBUNGEN = {
  "Brust": ["Bankdrücken", "Schrägbankdrücken", "Kurzhantel-Bankdrücken", "Butterfly", "Kabelzug-Crossover", "Dips"],
  "Rücken": ["Klimmzüge", "Latziehen", "Rudern am Kabel", "Langhantelrudern", "Kurzhantelrudern", "Kreuzheben"],
  "Schultern": ["Schulterdrücken", "Seitheben", "Frontheben", "Face Pulls", "Reverse Butterfly"],
  "Bizeps": ["Langhantel-Curls", "Kurzhantel-Curls", "Hammer-Curls", "Scott-Curls", "Kabel-Curls"],
  "Trizeps": ["Trizepsdrücken am Kabel", "French Press", "Überkopf-Trizepsstrecken", "Enges Bankdrücken", "Dips"],
  "Beine": ["Kniebeugen", "Beinpresse", "Ausfallschritte", "Beinstrecker", "Beinbeuger", "Rumänisches Kreuzheben", "Wadenheben"],
  "Bauch": ["Crunches", "Plank", "Beinheben hängend", "Kabel-Crunches", "Russian Twists"]
};

// ---------- Neues Training ----------
const TRAININGS_NAME = "trainings";
let aktuelleUebungen = [];

function ladeTrainings() {
  return JSON.parse(localStorage.getItem(TRAININGS_NAME)) || [];
}

function speichereTrainings(trainings) {
  localStorage.setItem(TRAININGS_NAME, JSON.stringify(trainings));
}

const regionAuswahl = document.getElementById("region");
const uebungAuswahl = document.getElementById("uebung-auswahl");
const saetzeBox = document.getElementById("saetze");

Object.keys(UEBUNGEN).forEach((region) => {
  regionAuswahl.add(new Option(region, region));
});

// Eigene Übungen pro Körperregion
const EIGENE_NAME = "eigeneUebungen";
const NEUE_UEBUNG = "__neu__";

function ladeEigeneUebungen() {
  return JSON.parse(localStorage.getItem(EIGENE_NAME)) || {};
}

function fuelleUebungen(auswahl) {
  const region = regionAuswahl.value;
  const eigene = ladeEigeneUebungen()[region] || [];
  uebungAuswahl.innerHTML = "";
  UEBUNGEN[region].concat(eigene).forEach((u) => uebungAuswahl.add(new Option(u, u)));
  uebungAuswahl.add(new Option("➕ Neue Übung hinzufügen …", NEUE_UEBUNG));
  if (auswahl) uebungAuswahl.value = auswahl;
  letzteUebung = uebungAuswahl.value;
}
let letzteUebung = "";
regionAuswahl.addEventListener("change", () => fuelleUebungen());

uebungAuswahl.addEventListener("change", () => {
  if (uebungAuswahl.value !== NEUE_UEBUNG) {
    letzteUebung = uebungAuswahl.value;
    return;
  }
  const region = regionAuswahl.value;
  const name = (prompt("Name der neuen Übung (" + region + "):") || "").trim();
  if (!name) {
    uebungAuswahl.value = letzteUebung;
    return;
  }
  const alle = ladeEigeneUebungen();
  const liste = alle[region] || [];
  if (!UEBUNGEN[region].includes(name) && !liste.includes(name)) {
    liste.push(name);
    alle[region] = liste;
    localStorage.setItem(EIGENE_NAME, JSON.stringify(alle));
  }
  fuelleUebungen(name);
});

function nummeriereSaetze() {
  saetzeBox.querySelectorAll(".satz-nr").forEach((el, i) => (el.textContent = "Satz " + (i + 1)));
}

function satzHinzufuegen() {
  const zeile = document.createElement("div");
  zeile.className = "satz-zeile";
  zeile.innerHTML =
    '<span class="satz-nr"></span>' +
    '<input type="number" min="1" placeholder="Wdh." class="wdh">' +
    '<input type="number" min="0" step="0.5" placeholder="kg" class="kg">' +
    '<button type="button" class="loeschen">×</button>';
  zeile.querySelector(".loeschen").addEventListener("click", () => {
    zeile.remove();
    nummeriereSaetze();
  });
  saetzeBox.appendChild(zeile);
  nummeriereSaetze();
}

function setzeSaetzeZurueck() {
  saetzeBox.innerHTML = "";
  satzHinzufuegen();
  satzHinzufuegen();
  satzHinzufuegen();
}

document.getElementById("satz-plus").addEventListener("click", satzHinzufuegen);

document.getElementById("uebung-hinzufuegen").addEventListener("click", () => {
  const saetze = [];
  saetzeBox.querySelectorAll(".satz-zeile").forEach((zeile) => {
    const wdh = zeile.querySelector(".wdh").value;
    const kg = zeile.querySelector(".kg").value;
    if (wdh) saetze.push({ wdh: Number(wdh), gewicht: Number(kg || 0) });
  });
  if (saetze.length === 0) {
    alert("Bitte mindestens bei einem Satz die Wiederholungen eintragen.");
    return;
  }
  if (uebungAuswahl.value === NEUE_UEBUNG) {
    alert("Bitte zuerst eine Übung auswählen.");
    return;
  }
  aktuelleUebungen.push({ region: regionAuswahl.value, name: uebungAuswahl.value, saetze: saetze });
  setzeSaetzeZurueck();
  zeigeAktuelleUebungen();
});

function satzText(saetze) {
  return saetze.map((s) => s.wdh + " × " + s.gewicht + " kg").join(", ");
}

function zeigeAktuelleUebungen() {
  const liste = document.getElementById("uebungen-liste");
  liste.innerHTML = "";
  aktuelleUebungen.forEach((u, index) => {
    const li = document.createElement("li");
    li.innerHTML = "<div><strong>" + u.name + "</strong><br><span class='klein'>" + satzText(u.saetze) + "</span></div>";
    const knopf = document.createElement("button");
    knopf.className = "loeschen";
    knopf.textContent = "×";
    knopf.addEventListener("click", () => {
      aktuelleUebungen.splice(index, 1);
      zeigeAktuelleUebungen();
    });
    li.appendChild(knopf);
    liste.appendChild(li);
  });
}

document.getElementById("training-speichern").addEventListener("click", () => {
  const name = document.getElementById("training-name").value.trim();
  const dauer = document.getElementById("training-dauer").value;
  if (!name) { alert("Bitte gib dem Training einen Namen."); return; }
  if (aktuelleUebungen.length === 0) { alert("Bitte füge mindestens eine Übung hinzu."); return; }

  const trainings = ladeTrainings();
  trainings.push({ id: Date.now(), name: name, dauer: Number(dauer || 0), uebungen: aktuelleUebungen });
  speichereTrainings(trainings);

  aktuelleUebungen = [];
  document.getElementById("training-name").value = "";
  document.getElementById("training-dauer").value = "";
  zeigeAktuelleUebungen();
  zeigeTrainings();
  alert("Training gespeichert");
});

function zeigeTrainings() {
  const liste = document.getElementById("trainings-liste");
  liste.innerHTML = "";
  ladeTrainings().forEach((t) => {
    const li = document.createElement("li");
    const uebungen = t.uebungen.map((u) => u.name).join(", ");
    li.innerHTML = "<div><strong>" + t.name + "</strong> <span class='klein'>(" + (t.dauer || "?") + " Min.)</span><br><span class='klein'>" + uebungen + "</span></div>";
    const knopf = document.createElement("button");
    knopf.className = "loeschen";
    knopf.textContent = "×";
    knopf.addEventListener("click", () => {
      if (!confirm("Training „" + t.name + "“ wirklich löschen?")) return;
      speichereTrainings(ladeTrainings().filter((x) => x.id !== t.id));
      zeigeTrainings();
    });
    li.appendChild(knopf);
    liste.appendChild(li);
  });
}

fuelleUebungen();
setzeSaetzeZurueck();
zeigeTrainings();

// ---------- Training anpassen ----------
const anpAuswahl = document.getElementById("anpassen-auswahl");
const anpBereich = document.getElementById("anpassen-bereich");
const anpRegion = document.getElementById("anpassen-region");
const anpUebung = document.getElementById("anpassen-uebung");
let anpTraining = null;

Object.keys(UEBUNGEN).forEach((region) => anpRegion.add(new Option(region, region)));

function fuelleAnpUebungen(auswahl) {
  const region = anpRegion.value;
  const eigene = ladeEigeneUebungen()[region] || [];
  anpUebung.innerHTML = "";
  UEBUNGEN[region].concat(eigene).forEach((u) => anpUebung.add(new Option(u, u)));
  anpUebung.add(new Option("➕ Neue Übung hinzufügen …", NEUE_UEBUNG));
  if (auswahl) anpUebung.value = auswahl;
}
anpRegion.addEventListener("change", () => fuelleAnpUebungen());

anpUebung.addEventListener("change", () => {
  if (anpUebung.value !== NEUE_UEBUNG) return;
  const region = anpRegion.value;
  const name = (prompt("Name der neuen Übung (" + region + "):") || "").trim();
  if (!name) { fuelleAnpUebungen(); return; }
  const alle = ladeEigeneUebungen();
  const liste = alle[region] || [];
  if (!UEBUNGEN[region].includes(name) && !liste.includes(name)) {
    liste.push(name);
    alle[region] = liste;
    localStorage.setItem(EIGENE_NAME, JSON.stringify(alle));
  }
  fuelleAnpUebungen(name);
  fuelleUebungen();
});

function fuelleAnpAuswahl() {
  const trainings = ladeTrainings();
  anpAuswahl.innerHTML = "";
  anpAuswahl.add(new Option(trainings.length ? "Bitte wählen …" : "Noch keine Trainings gespeichert", ""));
  trainings.forEach((t) => anpAuswahl.add(new Option(t.name, t.id)));
  anpBereich.style.display = "none";
  anpTraining = null;
}

anpAuswahl.addEventListener("change", () => {
  const t = ladeTrainings().find((x) => String(x.id) === anpAuswahl.value);
  if (!t) { anpBereich.style.display = "none"; anpTraining = null; return; }
  anpTraining = JSON.parse(JSON.stringify(t));
  document.getElementById("anpassen-name").value = anpTraining.name;
  document.getElementById("anpassen-dauer").value = anpTraining.dauer || "";
  anpBereich.style.display = "block";
  zeigeAnpUebungen();
});

// Liest die aktuellen Eingabefelder in anpTraining zurück
function uebernehmeAnpEingaben() {
  document.querySelectorAll("#anpassen-uebungen .karte").forEach((karte, ui) => {
    const saetze = [];
    karte.querySelectorAll(".satz-zeile").forEach((zeile) => {
      const wdh = zeile.querySelector(".wdh").value;
      const kg = zeile.querySelector(".kg").value;
      saetze.push({ wdh: Number(wdh || 0), gewicht: Number(kg || 0) });
    });
    anpTraining.uebungen[ui].saetze = saetze;
  });
}

function zeigeAnpUebungen() {
  const box = document.getElementById("anpassen-uebungen");
  box.innerHTML = "";
  anpTraining.uebungen.forEach((u, ui) => {
    const karte = document.createElement("div");
    karte.className = "karte";

    const kopf = document.createElement("div");
    kopf.className = "uebung-kopf";
    kopf.innerHTML = "<strong>" + u.name + "</strong>";
    const entfernen = document.createElement("button");
    entfernen.className = "loeschen";
    entfernen.textContent = "Entfernen";
    entfernen.addEventListener("click", () => {
      if (!confirm("„" + u.name + "“ aus dem Training entfernen?")) return;
      uebernehmeAnpEingaben();
      anpTraining.uebungen.splice(ui, 1);
      zeigeAnpUebungen();
    });
    const knoepfe = document.createElement("div");
    knoepfe.className = "knoepfe";
    [["▲", -1], ["▼", 1]].forEach(([zeichen, richtung]) => {
      const k = document.createElement("button");
      k.type = "button";
      k.className = "zweitrangig pfeil";
      k.textContent = zeichen;
      const ziel = ui + richtung;
      if (ziel < 0 || ziel >= anpTraining.uebungen.length) k.disabled = true;
      k.addEventListener("click", () => {
        uebernehmeAnpEingaben();
        const liste = anpTraining.uebungen;
        [liste[ui], liste[ziel]] = [liste[ziel], liste[ui]];
        zeigeAnpUebungen();
      });
      knoepfe.appendChild(k);
    });
    knoepfe.appendChild(entfernen);
    kopf.appendChild(knoepfe);
    karte.appendChild(kopf);

    u.saetze.forEach((satz, si) => {
      const zeile = document.createElement("div");
      zeile.className = "satz-zeile";
      zeile.innerHTML =
        '<span class="satz-nr">Satz ' + (si + 1) + '</span>' +
        '<input type="number" min="1" placeholder="Wdh." class="wdh" value="' + (satz.wdh || "") + '">' +
        '<input type="number" min="0" step="0.5" placeholder="kg" class="kg" value="' + (satz.gewicht ?? "") + '">' +
        '<button type="button" class="loeschen">×</button>';
      zeile.querySelector(".loeschen").addEventListener("click", () => {
        uebernehmeAnpEingaben();
        anpTraining.uebungen[ui].saetze.splice(si, 1);
        zeigeAnpUebungen();
      });
      karte.appendChild(zeile);
    });

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "zweitrangig";
    plus.textContent = "+ Satz";
    plus.addEventListener("click", () => {
      uebernehmeAnpEingaben();
      const saetze = anpTraining.uebungen[ui].saetze;
      const letzter = saetze[saetze.length - 1] || { wdh: "", gewicht: "" };
      saetze.push({ wdh: letzter.wdh, gewicht: letzter.gewicht });
      zeigeAnpUebungen();
    });
    karte.appendChild(plus);
    box.appendChild(karte);
  });
}

document.getElementById("anpassen-hinzufuegen").addEventListener("click", () => {
  if (!anpTraining) return;
  if (anpUebung.value === NEUE_UEBUNG) { alert("Bitte zuerst eine Übung auswählen."); return; }
  uebernehmeAnpEingaben();
  anpTraining.uebungen.push({
    region: anpRegion.value,
    name: anpUebung.value,
    saetze: [{ wdh: "", gewicht: "" }, { wdh: "", gewicht: "" }, { wdh: "", gewicht: "" }]
  });
  zeigeAnpUebungen();
});

document.getElementById("anpassen-speichern").addEventListener("click", () => {
  if (!anpTraining) return;
  uebernehmeAnpEingaben();
  const name = document.getElementById("anpassen-name").value.trim();
  if (!name) { alert("Bitte gib dem Training einen Namen."); return; }
  anpTraining.name = name;
  anpTraining.dauer = Number(document.getElementById("anpassen-dauer").value || 0);
  // leere Sätze entfernen
  anpTraining.uebungen.forEach((u) => (u.saetze = u.saetze.filter((x) => x.wdh > 0)));
  anpTraining.uebungen = anpTraining.uebungen.filter((u) => u.saetze.length > 0);
  if (anpTraining.uebungen.length === 0) { alert("Das Training braucht mindestens eine Übung mit Wiederholungen."); return; }

  const trainings = ladeTrainings().map((t) => (t.id === anpTraining.id ? anpTraining : t));
  speichereTrainings(trainings);
  zeigeTrainings();
  const id = anpTraining.id;
  fuelleAnpAuswahl();
  anpAuswahl.value = id;
  anpAuswahl.dispatchEvent(new Event("change"));
  alert("Änderungen gespeichert");
});

fuelleAnpUebungen();

// ---------- Training starten ----------
const VERLAUF_NAME = "verlauf";
const PLAN_NAME = "plan"; // wird von "Training planen" befüllt
let laufendesTraining = null;

function ladeVerlauf() {
  return JSON.parse(localStorage.getItem(VERLAUF_NAME)) || [];
}

function heute() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function geplantesTrainingHeute() {
  const plan = JSON.parse(localStorage.getItem(PLAN_NAME)) || [];
  const eintrag = plan.find((p) => p.datum === heute() && !p.erledigt);
  if (!eintrag) return null;
  const training = ladeTrainings().find((t) => t.id === eintrag.trainingId);
  return training ? { eintrag: eintrag, training: training } : null;
}

function zeigeStartAuswahl() {
  stoppeTimer();
  document.getElementById("start-auswahl").style.display = "block";
  document.getElementById("start-laeuft").style.display = "none";
  laufendesTraining = null;

  const geplant = geplantesTrainingHeute();
  const box = document.getElementById("start-geplant-box");
  if (geplant) {
    box.style.display = "flex";
    const zeit = geplant.eintrag.uhrzeit ? " um " + geplant.eintrag.uhrzeit + " Uhr" : "";
    document.getElementById("start-geplant-text").textContent =
      "Heute" + zeit + " geplant: " + geplant.training.name + ". Möchtest du dieses Training starten?";
  } else {
    box.style.display = "none";
  }

  const auswahl = document.getElementById("start-training");
  auswahl.innerHTML = "";
  const trainings = ladeTrainings();
  if (trainings.length === 0) auswahl.add(new Option("Noch keine Trainings gespeichert", ""));
  trainings.forEach((t) => auswahl.add(new Option(t.name, t.id)));
}

function starteTraining(training, planEintrag) {
  laufendesTraining = {
    trainingId: training.id,
    name: training.name,
    planDatum: planEintrag ? planEintrag.datum : null,
    beginn: new Date().toISOString(),
    uebungen: JSON.parse(JSON.stringify(training.uebungen))
  };
  document.getElementById("start-auswahl").style.display = "none";
  document.getElementById("start-laeuft").style.display = "block";
  document.getElementById("start-info").textContent =
    training.name + " · gestartet um " + new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr";
  zeigeLaufendeUebungen();
  starteTimer();
}

function uebernehmeStartEingaben() {
  document.querySelectorAll("#start-uebungen .karte").forEach((karte, ui) => {
    karte.querySelectorAll(".satz-zeile").forEach((zeile, si) => {
      const satz = laufendesTraining.uebungen[ui].saetze[si];
      satz.wdh = Number(zeile.querySelector(".wdh").value || 0);
      satz.gewicht = Number(zeile.querySelector(".kg").value || 0);
      satz.erledigt = zeile.querySelector(".haken").checked;
    });
  });
}

function zeigeLaufendeUebungen() {
  const box = document.getElementById("start-uebungen");
  box.innerHTML = "";
  laufendesTraining.uebungen.forEach((u, ui) => {
    const karte = document.createElement("div");
    karte.className = "karte";
    karte.innerHTML = "<strong>" + u.name + "</strong>";

    u.saetze.forEach((satz, si) => {
      const zeile = document.createElement("div");
      zeile.className = "satz-zeile start-zeile" + (satz.erledigt ? " erledigt" : "");
      zeile.innerHTML =
        '<span class="satz-nr">Satz ' + (si + 1) + '</span>' +
        '<input type="number" min="0" placeholder="Wdh." class="wdh" value="' + (satz.wdh || "") + '">' +
        '<input type="number" min="0" step="0.5" placeholder="kg" class="kg" value="' + (satz.gewicht ?? "") + '">' +
        '<input type="checkbox" class="haken"' + (satz.erledigt ? " checked" : "") + '>';
      zeile.querySelector(".haken").addEventListener("change", (e) => {
        zeile.classList.toggle("erledigt", e.target.checked);
      });
      karte.appendChild(zeile);
    });

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "zweitrangig";
    plus.textContent = "+ Satz";
    plus.addEventListener("click", () => {
      uebernehmeStartEingaben();
      const saetze = laufendesTraining.uebungen[ui].saetze;
      const letzter = saetze[saetze.length - 1] || { wdh: "", gewicht: "" };
      saetze.push({ wdh: letzter.wdh, gewicht: letzter.gewicht, erledigt: false });
      zeigeLaufendeUebungen();
    });
    karte.appendChild(plus);
    box.appendChild(karte);
  });
}

document.getElementById("start-geplant").addEventListener("click", () => {
  const geplant = geplantesTrainingHeute();
  if (geplant) starteTraining(geplant.training, geplant.eintrag);
});

document.getElementById("start-anderes").addEventListener("click", () => {
  const id = document.getElementById("start-training").value;
  const training = ladeTrainings().find((t) => String(t.id) === id);
  if (!training) { alert("Bitte zuerst ein Training anlegen."); return; }
  const geplant = geplantesTrainingHeute();
  if (geplant && geplant.training.id !== training.id &&
      !confirm("Heute ist eigentlich „" + geplant.training.name + "“ geplant. Trotzdem „" + training.name + "“ starten?")) return;
  starteTraining(training, null);
});

document.getElementById("start-abbrechen").addEventListener("click", () => {
  if (confirm("Training abbrechen? Die Eingaben gehen verloren.")) zeigeStartAuswahl();
});

document.getElementById("start-beenden").addEventListener("click", () => {
  uebernehmeStartEingaben();
  const gemacht = laufendesTraining.uebungen
    .map((u) => ({ region: u.region, name: u.name, saetze: u.saetze.filter((s) => s.wdh > 0).map((s) => ({ wdh: s.wdh, gewicht: s.gewicht })) }))
    .filter((u) => u.saetze.length > 0);
  if (gemacht.length === 0) { alert("Es wurden noch keine Sätze eingetragen."); return; }
  if (!confirm("Training beenden und speichern?")) return;

  // 1. Im Verlauf speichern (für "Fortschritt")
  const ende = new Date();
  const verlauf = ladeVerlauf();
  verlauf.push({
    id: Date.now(),
    datum: heute(),
    trainingId: laufendesTraining.trainingId,
    name: laufendesTraining.name,
    dauerMinuten: Math.round((ende - new Date(laufendesTraining.beginn)) / 60000),
    uebungen: gemacht
  });
  localStorage.setItem(VERLAUF_NAME, JSON.stringify(verlauf));

  // 2. Werte als neue Vorgabe ins gespeicherte Training übernehmen
  const trainings = ladeTrainings().map((t) => {
    if (t.id !== laufendesTraining.trainingId) return t;
    t.uebungen = t.uebungen.map((u) => {
      const neu = gemacht.find((g) => g.name === u.name);
      return neu ? { ...u, saetze: neu.saetze } : u;
    });
    return t;
  });
  speichereTrainings(trainings);
  zeigeTrainings();

  // 3. Geplanten Termin als erledigt markieren
  if (laufendesTraining.planDatum) {
    const plan = JSON.parse(localStorage.getItem(PLAN_NAME)) || [];
    plan.forEach((p) => {
      if (p.datum === laufendesTraining.planDatum && p.trainingId === laufendesTraining.trainingId) p.erledigt = true;
    });
    localStorage.setItem(PLAN_NAME, JSON.stringify(plan));
  }

  laufendesTraining = null;
  stoppeTimer();
  alert("Stark! Training gespeichert.");
  zeigeSeite("start");
});

// ---------- Fortschritt ----------

function formatDatum(iso) {
  const [j, m, t] = iso.split("-");
  return t + "." + m + ".";
}

function zahl(n) {
  return Math.round(n).toLocaleString("de-DE");
}

function volumen(einheit) {
  let summe = 0;
  einheit.uebungen.forEach((u) => u.saetze.forEach((s) => (summe += s.wdh * s.gewicht)));
  return summe;
}

function maxKraft(einheit, uebungName) {
  const u = einheit.uebungen.find((x) => x.name === uebungName);
  if (!u) return null;
  let best = 0;
  u.saetze.forEach((s) => {
    const wert = s.wdh === 1 ? s.gewicht : s.gewicht * (1 + s.wdh / 30);
    if (wert > best) best = wert;
  });
  return best > 0 ? best : null;
}

// Zeichnet ein einfaches Liniendiagramm als SVG
function zeichneDiagramm(ziel, punkte, einheit) {
  const box = document.getElementById(ziel);
  if (punkte.length === 0) { box.innerHTML = "<p class='klein'>Noch keine Daten.</p>"; return; }
  const B = 320, H = 180, L = 44, R = 10, O = 12, U = 26;
  const werte = punkte.map((p) => p.wert);
  let min = Math.min(...werte), max = Math.max(...werte);
  if (min === max) { min = min * 0.9; max = max * 1.1 || 1; }
  const x = (i) => L + (punkte.length === 1 ? (B - L - R) / 2 : (i * (B - L - R)) / (punkte.length - 1));
  const y = (w) => O + (H - O - U) * (1 - (w - min) / (max - min));

  let svg = '<svg class="diagramm" viewBox="0 0 ' + B + " " + H + '">';
  for (let k = 0; k <= 3; k++) {
    const w = min + ((max - min) * k) / 3;
    svg += '<line x1="' + L + '" x2="' + (B - R) + '" y1="' + y(w) + '" y2="' + y(w) + '" stroke="#2a2a2e"/>';
    svg += '<text x="' + (L - 4) + '" y="' + (y(w) + 3) + '" text-anchor="end">' + zahl(w) + "</text>";
  }
  svg += '<polyline fill="none" stroke="#ff7a1a" stroke-width="2.5" points="' +
    punkte.map((p, i) => x(i) + "," + y(p.wert)).join(" ") + '"/>';
  const schritt = Math.ceil(punkte.length / 6);
  punkte.forEach((p, i) => {
    svg += '<circle cx="' + x(i) + '" cy="' + y(p.wert) + '" r="3.5" fill="#ff7a1a"><title>' +
      formatDatum(p.datum) + ": " + zahl(p.wert) + " " + einheit + "</title></circle>";
    if (i % schritt === 0 || i === punkte.length - 1) {
      svg += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + formatDatum(p.datum) + "</text>";
    }
  });
  svg += "</svg>";
  box.innerHTML = svg;
}

function veraenderung(punkte) {
  if (punkte.length < 2) return "";
  const letzte = punkte[punkte.length - 1];
  const grenze = new Date(letzte.datum);
  grenze.setDate(grenze.getDate() - 28);
  const vorher = punkte.filter((p) => new Date(p.datum) <= grenze);
  const basis = vorher.length ? vorher[vorher.length - 1] : punkte[0];
  if (!basis.wert || basis === letzte) return "";
  const prozent = ((letzte.wert - basis.wert) / basis.wert) * 100;
  return " · Veränderung seit " + formatDatum(basis.datum) + ": " + (prozent >= 0 ? "+" : "") + prozent.toFixed(1).replace(".", ",") + " %";
}

function zeigeFortschritt() {
  const trainings = ladeTrainings();
  const verlauf = ladeVerlauf();
  const box = document.getElementById("fs-karten");
  const leer = document.getElementById("fs-leer");
  box.innerHTML = "";
  if (verlauf.length === 0 || trainings.length === 0) {
    leer.textContent = "Noch keine absolvierten Trainings. Starte ein Training, dann erscheint hier dein Fortschritt.";
    return;
  }
  leer.textContent = "";
  trainings.forEach((t) => box.appendChild(trainingsKarte(t, verlauf)));
}

function trainingsKarte(training, verlauf) {
  const einheiten = verlauf
    .filter((e) => e.trainingId === training.id)
    .sort((a, b) => a.datum.localeCompare(b.datum) || a.id - b.id);
  const tid = "fs-" + training.id;

  const karte = document.createElement("div");
  karte.className = "karte";
  karte.innerHTML = "<h2>" + training.name + "</h2>";

  if (einheiten.length === 0) {
    karte.innerHTML += "<p class='klein'>Noch nicht absolviert.</p>";
    return karte;
  }

  // Volumen
  karte.innerHTML += "<strong>Trainingsvolumen</strong><div id='" + tid + "-vol'></div><p class='klein' id='" + tid + "-vol-info'></p>";

  // Maximalkraft
  const namen = [];
  einheiten.forEach((e) => e.uebungen.forEach((u) => { if (!namen.includes(u.name)) namen.push(u.name); }));
  karte.innerHTML += "<strong>Geschätzte Maximalkraft</strong>";
  const auswahl = document.createElement("select");
  namen.forEach((n) => auswahl.add(new Option(n, n)));
  karte.appendChild(auswahl);
  const kraft = document.createElement("div");
  kraft.id = tid + "-kraft";
  karte.appendChild(kraft);
  const kraftInfo = document.createElement("p");
  kraftInfo.className = "klein";
  karte.appendChild(kraftInfo);

  // Letzte Einheiten
  const titel = document.createElement("strong");
  titel.textContent = "Letzte Einheiten";
  karte.appendChild(titel);
  const liste = document.createElement("ul");
  liste.className = "liste";
  einheiten.slice().reverse().slice(0, 5).forEach((e) => {
    const li = document.createElement("li");
    li.className = "grau";
    li.innerHTML = "<div><strong>" + formatDatum(e.datum) + e.datum.slice(0, 4) + "</strong> <span class='klein'>(" +
      (e.dauerMinuten || 0) + " Min.)</span><br><span class='klein'>Volumen " + zahl(volumen(e)) + " kg</span></div>";
    const knopf = document.createElement("button");
    knopf.className = "loeschen";
    knopf.textContent = "×";
    knopf.addEventListener("click", () => {
      if (!confirm("Diese Einheit aus dem Verlauf löschen?")) return;
      localStorage.setItem(VERLAUF_NAME, JSON.stringify(ladeVerlauf().filter((x) => x.id !== e.id)));
      zeigeFortschritt();
    });
    li.appendChild(knopf);
    liste.appendChild(li);
  });
  karte.appendChild(liste);

  // Diagramme zeichnen, sobald die Karte im Dokument ist
  setTimeout(() => {
    const vol = einheiten.map((e) => ({ datum: e.datum, wert: volumen(e) }));
    zeichneDiagramm(tid + "-vol", vol, "kg");
    const best = Math.max(...vol.map((p) => p.wert));
    document.getElementById(tid + "-vol-info").textContent =
      "Zuletzt: " + zahl(vol[vol.length - 1].wert) + " kg · Bestwert: " + zahl(best) + " kg" + veraenderung(vol);

    const zeigeKraft = () => {
      const punkte = einheiten
        .map((e) => ({ datum: e.datum, wert: maxKraft(e, auswahl.value) }))
        .filter((p) => p.wert !== null);
      zeichneDiagramm(kraft.id, punkte, "kg");
      if (!punkte.length) { kraftInfo.textContent = ""; return; }
      const b = Math.max(...punkte.map((p) => p.wert));
      const l = punkte[punkte.length - 1].wert;
      const rekord = punkte.length > 1 && l >= b ? " 🏆 Neuer Bestwert!" : "";
      kraftInfo.classList.toggle("rekord", rekord !== "");
      kraftInfo.textContent = "Zuletzt: ca. " + zahl(l) + " kg · Bestwert: ca. " + zahl(b) + " kg" + veraenderung(punkte) + rekord;
    };
    auswahl.addEventListener("change", zeigeKraft);
    zeigeKraft();
  }, 0);

  return karte;
}

// ---------- Training planen ----------
const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function ladePlan() {
  return JSON.parse(localStorage.getItem(PLAN_NAME)) || [];
}

function speicherePlan(plan) {
  localStorage.setItem(PLAN_NAME, JSON.stringify(plan));
}

function datumText(iso) {
  const d = new Date(iso + "T12:00:00");
  return WOCHENTAGE[d.getDay()] + ", " + d.toLocaleDateString("de-DE");
}

function endzeit(iso, uhrzeit, minuten) {
  const d = new Date(iso + "T" + uhrzeit + ":00");
  d.setMinutes(d.getMinutes() + (minuten || 60));
  return d;
}

function montag(iso) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function zeigeEndzeit() {
  const t = ladeTrainings().find((x) => String(x.id) === document.getElementById("plan-training").value);
  const datum = document.getElementById("plan-datum").value;
  const zeit = document.getElementById("plan-uhrzeit").value;
  const info = document.getElementById("plan-ende");
  if (!t || !datum || !zeit) { info.textContent = ""; return; }
  const ende = endzeit(datum, zeit, t.dauer);
  info.textContent = "Dauer " + (t.dauer || 60) + " Min. · Ende ca. " +
    ende.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr";
}

["plan-training", "plan-datum", "plan-uhrzeit"].forEach((id) =>
  document.getElementById(id).addEventListener("change", zeigeEndzeit));

function zeigePlanen() {
  const auswahl = document.getElementById("plan-training");
  const vorher = auswahl.value;
  auswahl.innerHTML = "";
  const trainings = ladeTrainings();
  if (trainings.length === 0) auswahl.add(new Option("Noch keine Trainings gespeichert", ""));
  trainings.forEach((t) => auswahl.add(new Option(t.name, t.id)));
  if (vorher) auswahl.value = vorher;
  if (!document.getElementById("plan-datum").value) document.getElementById("plan-datum").value = heute();
  zeigeEndzeit();
  zeigePlanListe();
}

document.getElementById("plan-hinzufuegen").addEventListener("click", () => {
  const trainingId = Number(document.getElementById("plan-training").value);
  const datum = document.getElementById("plan-datum").value;
  const uhrzeit = document.getElementById("plan-uhrzeit").value;
  if (!trainingId) { alert("Bitte zuerst ein Training anlegen."); return; }
  if (!datum || !uhrzeit) { alert("Bitte Datum und Uhrzeit wählen."); return; }
  const plan = ladePlan();
  if (plan.some((p) => p.datum === datum && !p.erledigt) &&
      !confirm("An diesem Tag ist schon ein Training geplant. Trotzdem einplanen?")) return;
  plan.push({ id: Date.now(), trainingId: trainingId, datum: datum, uhrzeit: uhrzeit, erledigt: false });
  speicherePlan(plan);
  zeigePlanListe();
});

function planZeile(p, training, verpasst) {
  const li = document.createElement("li");
  if (verpasst) li.className = "verpasst";
  else if (p.datum === heute()) li.className = "heute";
  const ende = endzeit(p.datum, p.uhrzeit, training.dauer).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  li.innerHTML = "<div><strong>" + training.name + "</strong><br><span class='klein'>" + datumText(p.datum) +
    " · " + p.uhrzeit + "–" + ende + " Uhr</span></div>";

  const knoepfe = document.createElement("div");
  knoepfe.className = "plan-knoepfe";

  const verschieben = document.createElement("button");
  verschieben.className = "zweitrangig";
  verschieben.textContent = "Verschieben";
  verschieben.addEventListener("click", () => {
    const vorschlag = verpasst ? heute() : p.datum;
    const neu = prompt("Neues Datum (TT.MM.JJJJ):", vorschlag.split("-").reverse().join("."));
    if (!neu) return;
    const teile = neu.trim().split(".");
    if (teile.length !== 3 || teile[2].length !== 4) { alert("Bitte im Format TT.MM.JJJJ eingeben."); return; }
    const iso = teile[2] + "-" + teile[1].padStart(2, "0") + "-" + teile[0].padStart(2, "0");
    if (isNaN(new Date(iso))) { alert("Ungültiges Datum."); return; }
    const zeit = prompt("Uhrzeit (HH:MM):", p.uhrzeit);
    if (!zeit || !/^\d{1,2}:\d{2}$/.test(zeit.trim())) return;
    const plan = ladePlan();
    const eintrag = plan.find((x) => x.id === p.id);
    eintrag.datum = iso;
    eintrag.uhrzeit = zeit.trim().padStart(5, "0");
    speicherePlan(plan);
    zeigePlanListe();
    if (confirm("Verschoben. Neuen Termin als Kalenderdatei herunterladen?")) ladeIcs([eintrag]);
  });
  knoepfe.appendChild(verschieben);

  if (!verpasst) {
    const kal = document.createElement("button");
    kal.className = "zweitrangig";
    kal.textContent = "📅 Kalender";
    kal.addEventListener("click", () => ladeIcs([p]));
    knoepfe.appendChild(kal);
  }

  const loeschen = document.createElement("button");
  loeschen.className = "loeschen";
  loeschen.textContent = "×";
  loeschen.addEventListener("click", () => {
    if (!confirm("Diesen Termin aus dem Plan löschen?")) return;
    speicherePlan(ladePlan().filter((x) => x.id !== p.id));
    zeigePlanListe();
  });
  knoepfe.appendChild(loeschen);

  li.appendChild(knoepfe);
  return li;
}

function zeigePlanListe() {
  const trainings = ladeTrainings();
  const plan = ladePlan()
    .filter((p) => !p.erledigt && trainings.some((t) => t.id === p.trainingId))
    .sort((a, b) => (a.datum + a.uhrzeit).localeCompare(b.datum + b.uhrzeit));
  const finde = (p) => trainings.find((t) => t.id === p.trainingId);

  const verpasst = plan.filter((p) => p.datum < heute());
  const kommend = plan.filter((p) => p.datum >= heute());

  const vBox = document.getElementById("plan-verpasst-box");
  const vListe = document.getElementById("plan-verpasst");
  vListe.innerHTML = "";
  vBox.style.display = verpasst.length ? "block" : "none";
  verpasst.forEach((p) => vListe.appendChild(planZeile(p, finde(p), true)));

  const liste = document.getElementById("plan-liste");
  liste.innerHTML = "";
  if (kommend.length === 0) liste.innerHTML = "<p class='klein'>Noch nichts geplant.</p>";
  let letzteWoche = "";
  kommend.forEach((p) => {
    const mo = montag(p.datum);
    const so = new Date(mo); so.setDate(so.getDate() + 6);
    const woche = "Woche " + mo.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + "–" +
      so.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
    if (woche !== letzteWoche) {
      const kopf = document.createElement("div");
      kopf.className = "woche";
      kopf.textContent = woche;
      liste.appendChild(kopf);
      letzteWoche = woche;
    }
    liste.appendChild(planZeile(p, finde(p), false));
  });
  document.getElementById("plan-alle-ics").style.display = kommend.length ? "block" : "none";
}

document.getElementById("plan-alle-ics").addEventListener("click", () => {
  const kommend = ladePlan().filter((p) => !p.erledigt && p.datum >= heute());
  if (kommend.length) ladeIcs(kommend);
});

// ---------- Kalenderdatei (.ics) für Outlook, Hotmail, iPhone ----------
function icsZeit(d) {
  const z = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + "T" + z(d.getHours()) + z(d.getMinutes()) + "00";
}

function icsText(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function ladeIcs(eintraege) {
  const trainings = ladeTrainings();
  const zeilen = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mein Training//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE", "TZID:Europe/Berlin",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST", "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET", "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
    "END:VTIMEZONE"
  ];
  eintraege.forEach((p) => {
    const t = trainings.find((x) => x.id === p.trainingId);
    if (!t) return;
    const beginn = new Date(p.datum + "T" + p.uhrzeit + ":00");
    const ende = endzeit(p.datum, p.uhrzeit, t.dauer);
    const uebungen = t.uebungen.map((u) => "- " + u.name + " (" + u.saetze.length + " Sätze)").join("\n");
    zeilen.push(
      "BEGIN:VEVENT",
      "UID:training-" + p.id + "@mein-training",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      "DTSTART;TZID=Europe/Berlin:" + icsZeit(beginn),
      "DTEND;TZID=Europe/Berlin:" + icsZeit(ende),
      "SUMMARY:" + icsText("Training: " + t.name),
      "DESCRIPTION:" + icsText(uebungen),
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Training", "TRIGGER:-PT30M", "END:VALARM",
      "END:VEVENT"
    );
  });
  zeilen.push("END:VCALENDAR");

  const blob = new Blob([zeilen.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = eintraege.length === 1 ? "training.ics" : "trainingsplan.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// ---------- Startseite: Heute-Bereich ----------
function zeigeHero() {
  const geplant = geplantesTrainingHeute();
  document.getElementById("hero-heute").textContent = geplant
    ? geplant.training.name + (geplant.eintrag.uhrzeit ? " · " + geplant.eintrag.uhrzeit + " Uhr" : "")
    : "Kein Training geplant";
  const verlauf = ladeVerlauf().sort((a, b) => a.datum.localeCompare(b.datum) || a.id - b.id);
  const letztes = verlauf[verlauf.length - 1];
  document.getElementById("hero-letztes").textContent = letztes
    ? "Letztes Training: " + letztes.name + " am " + formatDatum(letztes.datum) + " · " + zahl(volumen(letztes)) + " kg bewegt"
    : "Noch kein Training absolviert – leg los!";
}

// ---------- Trainings-Timer ----------
let timerIntervall = null;
function starteTimer() {
  stoppeTimer();
  const el = document.getElementById("start-timer");
  const tick = () => {
    if (!laufendesTraining) return;
    const sek = Math.floor((Date.now() - new Date(laufendesTraining.beginn)) / 1000);
    const h = Math.floor(sek / 3600), m = Math.floor((sek % 3600) / 60), x = sek % 60;
    el.textContent = (h ? h + ":" : "") + String(m).padStart(2, "0") + ":" + String(x).padStart(2, "0");
  };
  tick();
  timerIntervall = setInterval(tick, 1000);
}
function stoppeTimer() {
  if (timerIntervall) clearInterval(timerIntervall);
  timerIntervall = null;
}

// ---------- Start ----------
zeigeProfil();
zeigeSeite("start");
