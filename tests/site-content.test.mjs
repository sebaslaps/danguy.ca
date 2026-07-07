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

test('shared layout recreates yellow black archived visual identity', () => {
  const layout = read('src/layouts/BaseLayout.astro');
  assert.match(layout, /--yellow:\s*#ffd400/i);
  assert.match(layout, /class="brand-logo"/);
  assert.match(layout, /DANGUY/);
  assert.match(layout, /EXCAVATION/);
  assert.match(layout, /class:list=\{\[/);
  assert.match(layout, /active/);
  assert.match(layout, /Tous droits réservés/);
  assert.match(layout, /2020/);
});

test('homepage recreates archived home content and specialties', () => {
  const home = read('src/pages/index.astro');
  assert.match(home, /NOTRE SAVOIR-FAIRE AU SERVICE DE VOS PROJETS D'EXCAVATION/);
  assert.match(home, /Excavation Danguy Inc\., votre spécialiste en excavation à Sainte-Marie/);
  assert.match(home, /Excavation, terrassement et bien plus!/);
  assert.match(home, /Installations septiques éprouvées/);
  assert.match(home, /Vaste sélection de matériaux en vrac/);
  for (const material of ['Pierre', 'Paillis', 'Terre', 'Sable', 'Compost', 'Fumier', 'Gravier', 'Concassé', 'Pierre décorative', 'Poussière de pierre']) {
    assert.match(home, new RegExp(material));
  }
  for (const specialty of ['Excavation', 'Terrassement', 'Installations septiques', 'Livraison de matériaux', 'Centre de vrac']) {
    assert.match(home, new RegExp(specialty));
  }
});

test('services page recreates archived services, gallery, brands, and CTA', () => {
  const services = read('src/pages/services.astro');
  assert.match(services, /À Sainte-Marie, vos travaux d’excavation sont entre bonnes mains/);
  assert.match(services, /Nous sommes l’équipe qu’il vous faut!/);
  for (const alt of ['bobcat', 'tombereau', 'Site de fouille', 'des roches', 'Tuyaux', 'aménagement paysager', 'gravier']) {
    assert.match(services, new RegExp(`alt="${alt}"`));
  }
  for (const service of ['Aménagement de quais en pierre', 'Déneigement de cours commerciales et industrielles', 'Tuyaux et accessoires BNQ, SDR et autres', 'Location d’espaces extérieurs', 'Location de terrains']) {
    assert.match(services, new RegExp(service));
  }
  for (const brand of ['Biofiltre Ecoflo', 'Bionest', 'Enviro Septic']) {
    assert.match(services, new RegExp(brand));
  }
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
  assert.match(contact, /Français/);
  assert.match(contact, /Sainte-Marie et les environs/);
});

test('robots file points to danguy.ca sitemap', () => {
  const robots = read('public/robots.txt');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/danguy\.ca\/sitemap-index\.xml/);
});
