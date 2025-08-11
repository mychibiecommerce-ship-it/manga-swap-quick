#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DÉPLOIEMENT WEB MANGA SWAP');
console.log('================================');

// Fonction pour exécuter des commandes
function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description} - Terminé`);
  } catch (error) {
    console.error(`❌ Erreur lors de: ${description}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Vérification des prérequis
console.log('\n🔍 Vérification des prérequis...');

// Vérifier si on est dans le bon répertoire
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json non trouvé. Êtes-vous dans le bon répertoire ?');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'manga-swap') {
  console.error('❌ Ce script doit être exécuté depuis le projet manga-swap');
  process.exit(1);
}

console.log('✅ Projet manga-swap détecté');

// Choix de l'hébergeur
const args = process.argv.slice(2);
const platform = args[0] || 'vercel'; // vercel par défaut

console.log(`\n🎯 Plateforme de déploiement: ${platform}`);

// Nettoyage et préparation
runCommand('rm -rf web-build', 'Nettoyage des builds précédents');

// Build pour la production
runCommand('npm run build:web-prod', 'Build de l\'application pour le web');

// Optimisations post-build
console.log('\n⚡ Optimisations post-build...');

const webBuildPath = path.join(process.cwd(), 'web-build');
if (fs.existsSync(webBuildPath)) {
  // Créer un fichier _redirects pour Netlify
  if (platform === 'netlify') {
    const redirectsContent = '/*    /index.html   200';
    fs.writeFileSync(path.join(webBuildPath, '_redirects'), redirectsContent);
    console.log('✅ Fichier _redirects créé pour Netlify');
  }
  
  // Optimiser les fichiers pour le SEO
  const indexPath = path.join(webBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Ajouter des métadonnées SEO
    const metaTags = `
    <meta name="description" content="Manga Swap - L'application #1 pour échanger vos mangas gratuitement en France. Trouvez les mangas que vous cherchez et proposez les vôtres !">
    <meta name="keywords" content="manga, échange, gratuit, France, collection, otaku, anime">
    <meta name="author" content="Manga Swap Team">
    <meta property="og:title" content="Manga Swap - Échange de Mangas Gratuit">
    <meta property="og:description" content="L'application #1 pour échanger vos mangas gratuitement en France">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://manga-swap.vercel.app">
    <meta property="og:image" content="https://manga-swap.vercel.app/static/js/og-image.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Manga Swap - Échange de Mangas Gratuit">
    <meta name="twitter:description" content="L'application #1 pour échanger vos mangas gratuitement en France">
    <link rel="canonical" href="https://manga-swap.vercel.app">
    `;
    
    indexContent = indexContent.replace('<meta name="viewport"', metaTags + '\n    <meta name="viewport"');
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Métadonnées SEO ajoutées');
  }
  
  console.log('✅ Optimisations terminées');
} else {
  console.error('❌ Dossier web-build non trouvé après le build');
  process.exit(1);
}

// Déploiement selon la plateforme
console.log(`\n🚀 Déploiement sur ${platform}...`);

switch (platform) {
  case 'vercel':
    console.log('\n🔵 DÉPLOIEMENT VERCEL');
    console.log('1. Installez Vercel CLI: npm i -g vercel');
    console.log('2. Connectez-vous: vercel login');
    console.log('3. Déployez: vercel --prod');
    console.log('\nOu visitez: https://vercel.com/new');
    break;
    
  case 'netlify':
    console.log('\n🟢 DÉPLOIEMENT NETLIFY');
    console.log('1. Installez Netlify CLI: npm i -g netlify-cli');
    console.log('2. Connectez-vous: netlify login');
    console.log('3. Déployez: netlify deploy --prod --dir=web-build');
    console.log('\nOu glissez-déposez le dossier web-build sur: https://app.netlify.com/drop');
    break;
    
  case 'github-pages':
    console.log('\n🟠 DÉPLOIEMENT GITHUB PAGES');
    console.log('1. Poussez votre code sur GitHub');
    console.log('2. Allez dans Settings > Pages');
    console.log('3. Configurez la source sur "GitHub Actions"');
    console.log('4. Le déploiement se fera automatiquement');
    break;
    
  default:
    console.log('\n🔧 DÉPLOIEMENT MANUEL');
    console.log('1. Uploadez le contenu du dossier web-build');
    console.log('2. Configurez les redirections vers index.html');
    console.log('3. Activez HTTPS si possible');
}

console.log('\n🎯 Taille du build:');
runCommand('du -sh web-build', 'Calcul de la taille');

console.log('\n🎉 PRÉPARATION TERMINÉE !');
console.log('================================');
console.log('📁 Dossier à déployer: web-build/');
console.log('🌐 URL suggérée: manga-swap.vercel.app');
console.log('📋 Instructions de déploiement affichées ci-dessus');

if (platform === 'vercel') {
  console.log('\n🚀 COMMANDE RAPIDE VERCEL:');
  console.log('npx vercel --prod');
}