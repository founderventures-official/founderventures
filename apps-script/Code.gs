/**
 * Founder Ventures — application receiver (Google Apps Script)
 *
 * Paste this into a Google Sheet's Apps Script editor (Extensions → Apps Script),
 * run `setup` once, then Deploy → New deployment → Web app
 * (Execute as: Me · Who has access: Anyone). Put the web app URL into the website.
 *
 * Each application:
 *   • adds one row to the "Applications" tab of this Sheet
 *   • saves the pitch deck to a private Drive folder
 *   • emails NOTIFY_EMAIL a summary
 *   • (optionally) emails the team a confirmation
 */

// ===== Settings — edit these =====
const NOTIFY_EMAIL = 'founderventures.official@gmail.com'; // who gets "new application" alerts (comma-separate several)
const SEND_CONFIRMATION = true;                  // email applicants a "we received it" message
const DRIVE_FOLDER_NAME = 'Founder Ventures — Pitch Decks';
const SHEET_NAME = 'Applications';
const MAX_FILE_MB = 20;
const ALLOWED_EXT = ['pdf', 'ppt', 'pptx', 'key'];
// =================================

const HEADERS = [
  'ID', 'Submitted', 'Status', 'Track', 'Organization', 'Date founded', 'Country',
  'Team size', 'Summary', 'Members', 'Member emails', 'Guardians', 'Pitch deck', 'Raw data'
];

/** Run once from the editor to create the sheet and folder (and grant permissions). */
function setup() {
  const sheet = getSheet_();
  getFolder_();
  Logger.log('Ready: ' + sheet.getParent().getUrl());
}

/** Visiting the URL in a browser shows this — handy to check the deployment works. */
function doGet() {
  return json_({ ok: true, message: 'Founder Ventures application endpoint is running.' });
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Spam trap: real visitors never fill the hidden "website" field.
    if (data.website) return json_({ ok: true, id: 'FV-IGNORED' });

    const error = validate_(data);
    if (error) return json_({ ok: false, error: error });

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const id = makeId_();
      const deck = saveDeck_(data, id);
      const row = buildRow_(data, id, deck);
      getSheet_().appendRow(row);
      notify_(data, id, deck);
      if (SEND_CONFIRMATION) confirm_(data, id);
      return json_({ ok: true, id: id });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Server error. Please try again.' });
  }
}

// ---------- validation ----------
function validate_(d) {
  if (!d || typeof d !== 'object') return 'Invalid submission.';
  if (['business', 'nonprofit'].indexOf(d.track) < 0) return 'Please choose a track.';
  const p = d.project || {};
  if (!str_(p.name)) return 'Business/NGO name is required.';
  if (!str_(p.summary)) return 'A short summary is required.';
  const m = Array.isArray(d.members) ? d.members : [];
  if (m.length < 2) return 'Teams need at least 2 members.';
  for (let i = 0; i < m.length; i++) {
    const x = m[i] || {};
    if (!str_(x.first) || !str_(x.last) || !str_(x.email) || !str_(x.dob)) {
      return 'Member ' + (i + 1) + ' is missing required details.';
    }
    const age = ageFrom_(x.dob);
    if (age === null || age < 14 || age > 28) return 'All members must be aged 14–28.';
    if (age < 18) {
      const g = (d.guardians || []).filter(function (g) { return g.member === i + 1; })[0];
      if (!g || !str_(g.first) || !str_(g.last) || !str_(g.email)) {
        return 'Guardian details are required for member ' + (i + 1) + ' (under 18).';
      }
    }
  }
  if (!d.consent) return 'Consent is required.';
  const f = d.file;
  if (!f || !f.data || !f.name) return 'Please attach your pitch deck.';
  const ext = String(f.name).split('.').pop().toLowerCase();
  if (ALLOWED_EXT.indexOf(ext) < 0) return 'Pitch deck must be a PDF, PowerPoint or Keynote file.';
  if (f.data.length * 0.75 > MAX_FILE_MB * 1024 * 1024) return 'Pitch deck must be under ' + MAX_FILE_MB + ' MB.';
  return '';
}

// ---------- storage ----------
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#000000').setFontColor('#ffffff');
    sh.setColumnWidths(1, HEADERS.length, 160);
    sh.setColumnWidth(9, 320); sh.setColumnWidth(10, 420); sh.setColumnWidth(12, 320);
    const status = SpreadsheetApp.newDataValidation()
      .requireValueInList(['New', 'Reviewing', 'Zoom pitch', 'Due diligence', 'Offer', 'Declined'], true).build();
    sh.getRange('C2:C').setDataValidation(status);
  }
  return sh;
}

function getFolder_() {
  const it = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function saveDeck_(d, id) {
  const f = d.file;
  const bytes = Utilities.base64Decode(f.data);
  const clean = String(f.name).replace(/[^\w.\- ]+/g, '_').slice(0, 120);
  const name = id + ' — ' + String(d.project.name).slice(0, 60) + ' — ' + clean;
  const blob = Utilities.newBlob(bytes, f.type || 'application/octet-stream', name);
  const file = getFolder_().createFile(blob);
  return { url: file.getUrl(), name: name };
}

function buildRow_(d, id, deck) {
  const p = d.project;
  const members = d.members.map(function (m, i) {
    return (i + 1) + '. ' + [m.first + ' ' + m.last, m.dob + ' (age ' + ageFrom_(m.dob) + ')',
      m.gender, m.nationality, m.affiliation, m.email, m.phone].filter(Boolean).join(' — ');
  }).join('\n');
  const guardians = (d.guardians || []).map(function (g) {
    return 'Member ' + g.member + ': ' + [g.first + ' ' + g.last, g.relationship, g.email, g.phone].filter(Boolean).join(' — ');
  }).join('\n');
  const raw = JSON.parse(JSON.stringify(d)); delete raw.file; delete raw.website;
  return [
    id, new Date(), 'New',
    d.track === 'business' ? 'Business Venture' : 'Nonprofit Organization',
    p.name, p.dateFounded || '', p.country || '', p.teamSize || '', p.summary,
    members, d.members.map(function (m) { return m.email; }).join(', '),
    guardians, deck.url, JSON.stringify(raw)
  ].map(safe_);
}

// ---------- email ----------
function notify_(d, id, deck) {
  if (!NOTIFY_EMAIL || NOTIFY_EMAIL.indexOf('example.com') > -1) return;
  const p = d.project;
  const lines = [
    'New application ' + id,
    '',
    'Track: ' + (d.track === 'business' ? 'Business Venture' : 'Nonprofit Organization'),
    'Organization: ' + p.name,
    'Summary: ' + p.summary,
    'Team: ' + d.members.map(function (m) { return m.first + ' ' + m.last + ' <' + m.email + '>'; }).join(', '),
    '',
    'Pitch deck: ' + deck.url,
    'Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ];
  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: 'New application: ' + p.name + ' (' + id + ')', body: lines.join('\n') });
}

function confirm_(d, id) {
  const to = d.members.map(function (m) { return m.email; }).filter(function (e) { return /@/.test(e); }).join(',');
  if (!to) return;
  const body = [
    'Hi ' + d.members[0].first + ',',
    '',
    'Thank you for applying to Founder Ventures. We have received your team\'s application for ' + d.project.name + '.',
    'Your reference number is ' + id + '.',
    '',
    'Our team reviews applications on a rolling basis and will contact you by email about next steps.',
    '',
    '— Founder Ventures'
  ].join('\n');
  MailApp.sendEmail({ to: to, subject: 'We received your application (' + id + ')', body: body, name: 'Founder Ventures' });
}

// ---------- helpers ----------
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function str_(v) { return typeof v === 'string' && v.trim().length > 0; }
function safe_(v) { return (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v; } // stop formula injection
function makeId_() {
  const date = Utilities.formatDate(new Date(), 'UTC', 'yyMMdd');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'FV-' + date + '-' + rand;
}
function ageFrom_(dob) {
  const d = new Date(dob); if (isNaN(d)) return null;
  const n = new Date(); let a = n.getFullYear() - d.getFullYear();
  const m = n.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
  return a;
}
