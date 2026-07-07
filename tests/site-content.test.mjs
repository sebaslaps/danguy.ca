import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const file = (...parts) => join(root, ...parts);
const read = (...parts) => readFileSync(file(...parts), 'utf8');

const requiredFiles = [
  'astro.config.mjs',
  'netlify.toml',
  'src/layouts/BaseLayout.astro',
  'src/data/site.json',
  'src/pages/index.astro',
  'src/pages/services.astro',
  'src/pages/contactez-nous.astro',
  'public/robots.txt',
  'public/favicon.svg',
];

test('required project files exist', () => {
  for (const path of requiredFiles) {
    assert.ok(existsSync(file(path)), `${path} should exist`);
  }
});

test('site data preserves archived Danguy business details', () => {
  const site = JSON.parse(read('src/data/site.json'));
  assert.equal(site.name, 'Excavation Danguy Inc.');
  assert.equal(site.domain, 'danguy.ca');
  assert.equal(site.phone.display, '418-387-6746');
  assert.equal(site.phone.href, '+14183876746');
  assert.equal(site.email, 'info@danguy.ca');
  assert.match(site.address.street, /1425, rang Saint-Gabriel Nord/);
  assert.match(site.address.city, /Ste-Marie/);
  assert.match(site.address.postalCode, /G6E3A8/);
  assert.deepEqual(site.navigation.map((item) => item.label), ['Accueil', 'Services', 'Contactez-nous']);
});

test('shared layout recreates yellow black archived visual identity without Yellow Pages credits', () => {
  const layout = read('src/layouts/BaseLayout.astro');
  assert.match(layout, /--yellow:\s*#ffd400/i);
  assert.match(layout, /class="brand-logo"/);
  assert.match(layout, /DANGUY/);
  assert.match(layout, /EXCAVATION/);
  assert.match(layout, /class:list=\{\[/);
  assert.match(layout, /active/);
  assert.match(layout, /Tous droits réservés/);
  assert.match(layout, /2026/);
  assert.doesNotMatch(layout, /2020/);
  assert.doesNotMatch(layout, /Pages Jaunes/i);
  assert.doesNotMatch(layout, /pages-jaunes/i);
  assert.doesNotMatch(layout, /Création de/i);
});

test('homepage recreates archived home content and specialties without non-real pictures', () => {
  const home = read('src/pages/index.astro');
  assert.match(home, /NOTRE SAVOIR-FAIRE AU SERVICE DE VOS PROJETS D'EXCAVATION/);
  assert.match(home, /Excavation Danguy Inc\., votre spécialiste en excavation à Sainte-Marie/);
  assert.match(home, /Excavation, terrassement et bien plus!/);
  assert.match(home, /Installations septiques éprouvées/);
  assert.match(home, /Vaste sélection de matériaux en vrac/);
  assert.match(home, /class="hero-link-row"/);
  assert.match(home, /class="hero-link-card"/);
  assert.doesNotMatch(home, /class="service-visual/);
  assert.doesNotMatch(home, /excavation-visual|materials-visual/);
  assert.doesNotMatch(home, /<img\b/i);
  assert.doesNotMatch(home, /home-excavation|home-materials/i);
  for (const material of ['Pierre', 'Paillis', 'Terre', 'Sable', 'Compost', 'Fumier', 'Gravier', 'Concassé', 'Pierre décorative', 'Poussière de pierre']) {
    assert.match(home, new RegExp(material));
  }
  for (const specialty of ['Excavation', 'Terrassement', 'Installations septiques', 'Livraison de matériaux', 'Centre de vrac']) {
    assert.match(home, new RegExp(specialty));
  }
});

test('services page recreates archived services with text panels instead of fake pictures', () => {
  const services = read('src/pages/services.astro');
  assert.match(services, /À Sainte-Marie, vos travaux d’excavation sont entre bonnes mains/);
  assert.match(services, /Nous sommes l’équipe qu’il vous faut!/);
  assert.match(services, /class="service-panel-grid"/);
  assert.doesNotMatch(services, /<img\b/i);
  assert.doesNotMatch(services, /gallery-|brand-.*\.svg/i);
  for (const panel of ['Excavation et terrassement', 'Centre de vrac', 'Drains, ponceaux et tuyaux', 'Installations septiques']) {
    assert.match(services, new RegExp(panel));
  }
  for (const service of ['Aménagement de quais en pierre', 'Déneigement de cours commerciales et industrielles', 'Tuyaux et accessoires BNQ, SDR et autres', 'Location d’espaces extérieurs', 'Location de terrains']) {
    assert.match(services, new RegExp(service));
  }
  assert.doesNotMatch(services, /<h2>Marques<\/h2>/);
  assert.doesNotMatch(services, /class="brands-section"/);
  assert.doesNotMatch(services, /class="brand-grid"/);
  assert.doesNotMatch(services, /class="brand-name"/);
  assert.doesNotMatch(services, /Biofiltre Ecoflo|Bionest|Enviro Septic/);
  assert.doesNotMatch(services, /marques reconnues/i);
  assert.match(services, /Venez nous voir/);
});

test('contact page recreates archived contact information and form', () => {
  const contact = read('src/pages/contactez-nous.astro');
  assert.match(contact, /Appelez Excavation Danguy Inc\. à Sainte-Marie pour des travaux durables/);
  assert.match(contact, /Des travaux exécutés dans les règles de l’art/);
  assert.match(contact, /Demandez votre soumission dès aujourd’hui/);
  assert.match(contact, /<form/);
  for (const label of ['Nom*', 'Numéro de téléphone*', 'Adresse courriel*', 'Commentaires*', 'Envoyer']) {
    assert.match(contact, new RegExp(label));
  }
  assert.match(contact, /1425, rang Saint-Gabriel Nord/);
  assert.match(contact, /Ste-Marie, QC, G6E3A8/);
  assert.match(contact, /info@danguy.ca/);
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
    assert.match(contact, new RegExp(day));
    assert.match(contact, /8\s*a\.m\.-12\s*p\.m\./);
    assert.match(contact, /1-5\s*p\.m\./);
  }
  assert.match(contact, /Saturday/);
  assert.match(contact, /Sunday/);
  assert.match(contact, /Closed/);
  assert.doesNotMatch(contact, /Heures variables durant la saison/);
  assert.doesNotMatch(contact, /Langues parlées/);
  assert.doesNotMatch(contact, /<p>Français<\/p>/);
  assert.match(contact, /Sainte-Marie et les environs/);
});

test('robots file points to danguy.ca sitemap', () => {
  const robots = read('public/robots.txt');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/danguy\.ca\/sitemap-index\.xml/);
});
