// =====================================================================
//  Plus-opdrachten · koppeling met Firebase
//  Zolang hieronder nog "VUL_HIER_IN" staat, draait alles in DEMO-modus:
//  dan wordt alles alleen in deze browser bewaard (klascode: demo).
// =====================================================================

// 1) Plak hier de config van je Firebase-web-app
//    (Firebase console → Projectinstellingen → Je apps → Web-app → Config)
export const firebaseConfig = {
  apiKey: "AIzaSyD2FUMSdvKbaAdVuiBAIRZxXsdMSy7QQVk",
  authDomain: "plusopdrachten.firebaseapp.com",
  projectId: "plusopdrachten",
  storageBucket: "plusopdrachten.firebasestorage.app",
  messagingSenderId: "681793459434",
  appId: "1:681793459434:web:ed97b639b8f16f4a69b393"
};

// 2) E-mailadres(sen) van leerkrachten die mogen nakijken.
//    Zet hetzelfde adres ook in firestore.rules (dat is de echte beveiliging).
export const LEERKRACHTEN = ["a.marks@levwn.nl"];

// ---------------------------------------------------------------------
export const DEMO = !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("VUL");
const V = "10.12.2";
let fs, au, db, auth;

async function laadFirebase() {
  if (db) return;
  const appMod = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  fs = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
  au = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
  const app = appMod.initializeApp(firebaseConfig);
  db = fs.getFirestore(app);
  auth = au.getAuth(app);
}

// ------------------------------ HULP --------------------------------
// "  anna  de Vries" → "anna de vries" (sleutel om dubbele namen te herkennen)
export const naamSleutel = n => (n || "").toLowerCase().normalize("NFKC")
  .replace(/[^\p{L}\p{N} .'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 30);
// "anna" → "Anna"
export const netteNaam = n => { const s = (n || "").replace(/\s+/g, " ").trim().slice(0, 30); return s.charAt(0).toUpperCase() + s.slice(1); };
export const geldigePin = p => /^[0-9]{4}$/.test(p || "");

// Het account-id is een hash van klas + naam + code: alleen wie de code weet, vindt het werk.
export async function accountId(klas, naam, pin) {
  const data = new TextEncoder().encode(`${klas}|${naamSleutel(naam)}|${pin}`);
  const h = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
export const werkId = (opdracht, acct) => `${opdracht}__${acct}`;

function netjes(id, d) {
  if (!d) return null;
  const b = d.bijgewerkt;
  return { id, ...d, bijgewerkt: b && b.toMillis ? b.toMillis() : (b ?? null) };
}

// ---------------------------- DEMO-opslag ----------------------------
const DK = "plus-demo-db2";
const demoLuisteraars = new Set();
function dDb() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(DK)); } catch (e) {}
  if (!d) { d = { klassen: { demo: { naam: "Demoklas 5/6" } }, namen: {}, accounts: {}, werk: {} }; dSchrijf(d, true); }
  return d;
}
function dSchrijf(d, stil) {
  try { localStorage.setItem(DK, JSON.stringify(d)); } catch (e) {}
  if (!stil) demoLuisteraars.forEach(f => f());
}
try { window.addEventListener("storage", e => { if (e.key === DK) demoLuisteraars.forEach(f => f()); }); } catch (e) {}
const inKlas = (obj, klas) => Object.entries(obj).filter(([k]) => k.startsWith(klas + "/")).map(([k, v]) => [k.slice(klas.length + 1), v]);

// ----------------------------- LEERLING ------------------------------
async function leerlingStart() {
  if (DEMO) return;
  await laadFirebase();
  await auth.authStateReady();          // eerst kijken of er al iemand ingelogd is (bijv. de leerkracht)
  if (!auth.currentUser) await au.signInAnonymously(auth);
}

export async function haalKlas(code) {
  if (DEMO) return dDb().klassen[code] || null;
  await leerlingStart();
  const s = await fs.getDoc(fs.doc(db, "klassen", code));
  return s.exists() ? s.data() : null;
}

// Nieuw account. Gooit Error("naam-bezet") als de naam al gekozen is in deze klas.
export async function registreer(klas, naam, pin) {
  const key = naamSleutel(naam), nette = netteNaam(naam);
  const acct = await accountId(klas, naam, pin);
  const account = { naam: nette, naamKey: key, pin, aangemaakt: Date.now() };
  if (DEMO) {
    const d = dDb();
    if (d.namen[klas + "/" + key]) throw new Error("naam-bezet");
    d.namen[klas + "/" + key] = { naam: nette };
    d.accounts[klas + "/" + acct] = account;
    dSchrijf(d);
    return { acct, naam: nette };
  }
  await leerlingStart();
  const naamRef = fs.doc(db, "klassen", klas, "namen", key);
  if ((await fs.getDoc(naamRef)).exists()) throw new Error("naam-bezet");
  const b = fs.writeBatch(db);
  b.set(naamRef, { naam: nette });
  b.set(fs.doc(db, "klassen", klas, "accounts", acct), account);
  try { await b.commit(); }
  catch (e) { if (e.code === "permission-denied") throw new Error("naam-bezet"); throw e; }
  return { acct, naam: nette };
}

// Inloggen met naam + code. Geeft {acct, naam} of null.
export async function login(klas, naam, pin) {
  const acct = await accountId(klas, naam, pin);
  if (DEMO) { const a = dDb().accounts[klas + "/" + acct]; return a ? { acct, naam: a.naam } : null; }
  await leerlingStart();
  const s = await fs.getDoc(fs.doc(db, "klassen", klas, "accounts", acct));
  return s.exists() ? { acct, naam: s.data().naam } : null;
}

export async function haalWerk(klas, id) {
  if (DEMO) return netjes(id, dDb().werk[klas + "/" + id]);
  await leerlingStart();
  const s = await fs.getDoc(fs.doc(db, "klassen", klas, "werk", id));
  return s.exists() ? netjes(id, s.data()) : null;
}

// data: { acct, leerling, opdracht, antwoorden, status, ingeleverd }
export async function bewaarWerk(klas, id, data) {
  if (DEMO) {
    const d = dDb(), k = klas + "/" + id;
    d.werk[k] = { ...(d.werk[k] || {}), ...data, bijgewerkt: Date.now() };
    dSchrijf(d);
    return;
  }
  await leerlingStart();
  await fs.setDoc(fs.doc(db, "klassen", klas, "werk", id),
    { ...data, bijgewerkt: fs.serverTimestamp() }, { merge: true });
}

// ----------------------------- LEERKRACHT ----------------------------
export async function volgLeerkracht(cb) {
  if (DEMO) { cb({ email: LEERKRACHTEN[0], demo: true }); return; }
  await laadFirebase();
  au.onAuthStateChanged(auth, u => cb(u && !u.isAnonymous ? u : null));
}

export async function loginLeerkracht() {
  await laadFirebase();
  const p = new au.GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account", hd: "levwn.nl" });
  await au.signInWithPopup(auth, p);
}

export async function logoutLeerkracht() {
  if (DEMO) return;
  await au.signOut(auth);
}

export const isLeerkracht = u => !!u && LEERKRACHTEN.map(e => e.toLowerCase()).includes((u.email || "").toLowerCase());

export async function lijstKlassen() {
  if (DEMO) return Object.entries(dDb().klassen).map(([code, k]) => ({ code, ...k }));
  const s = await fs.getDocs(fs.collection(db, "klassen"));
  return s.docs.map(d => ({ code: d.id, ...d.data() }));
}

export async function bewaarKlas(code, data) {
  if (DEMO) { const d = dDb(); d.klassen[code] = data; dSchrijf(d); return; }
  await fs.setDoc(fs.doc(db, "klassen", code), data);
}

export async function verwijderKlas(code) {
  if (DEMO) { const d = dDb(); delete d.klassen[code]; dSchrijf(d); return; }
  await fs.deleteDoc(fs.doc(db, "klassen", code));
}

// Live lijst van alle leerling-accounts (naam + code) van een klas.
export async function volgAccounts(klas, cb) {
  if (DEMO) {
    const f = () => cb(inKlas(dDb().accounts, klas).map(([acct, a]) => ({ acct, ...a })));
    demoLuisteraars.add(f); f();
    return () => demoLuisteraars.delete(f);
  }
  await laadFirebase();
  return fs.onSnapshot(fs.collection(db, "klassen", klas, "accounts"),
    s => cb(s.docs.map(d => ({ acct: d.id, ...d.data() }))));
}

// Account verwijderen, samen met al het werk van die leerling. Daarna is de naam weer vrij.
export async function verwijderAccount(klas, acct, naamKey) {
  if (DEMO) {
    const d = dDb(); delete d.accounts[klas + "/" + acct]; delete d.namen[klas + "/" + naamKey];
    Object.keys(d.werk).forEach(k => { if (k.startsWith(klas + "/") && d.werk[k].acct === acct) delete d.werk[k]; });
    dSchrijf(d); return;
  }
  const b = fs.writeBatch(db);
  const werk = await fs.getDocs(fs.query(fs.collection(db, "klassen", klas, "werk"), fs.where("acct", "==", acct)));
  werk.docs.forEach(w => b.delete(w.ref));
  b.delete(fs.doc(db, "klassen", klas, "accounts", acct));
  b.delete(fs.doc(db, "klassen", klas, "namen", naamKey));
  await b.commit();
}

// Live meekijken met al het werk voor één opdracht.
export async function volgWerk(klas, opdracht, cb) {
  if (DEMO) {
    const f = () => cb(inKlas(dDb().werk, klas).filter(([, w]) => w.opdracht === opdracht).map(([id, w]) => netjes(id, w)));
    demoLuisteraars.add(f); f();
    return () => demoLuisteraars.delete(f);
  }
  await laadFirebase();
  const q = fs.query(fs.collection(db, "klassen", klas, "werk"), fs.where("opdracht", "==", opdracht));
  return fs.onSnapshot(q, s => cb(s.docs.map(d => netjes(d.id, d.data()))));
}

export async function bewaarNakijk(klas, id, basis, { feedback, nagekeken }) {
  if (DEMO) {
    const d = dDb(), k = klas + "/" + id;
    d.werk[k] = { ...(d.werk[k] || basis), feedback, nagekeken };
    dSchrijf(d);
    return;
  }
  await fs.setDoc(fs.doc(db, "klassen", klas, "werk", id), { ...basis, feedback, nagekeken }, { merge: true });
}
