## Script automatisé de réservation de plateaux sportifs du PEPS 

**Description**

Ce script automatise le processus de réservation de terrains au PEPS de l'Université Laval. Il utilise Puppeteer pour contrôler un navigateur sans tête et simuler les actions d'un utilisateur humain pour se connecter au portail de réservation et réserver un terrain.

**Fonctionnement**

1. **Configuration :** Le script nécessite un fichier de configuration nommé `config.json` contenant les informations suivantes:
    - `email`: Votre adresse courriel associée à votre compte PEPS
    - `password`: Votre mot de passe PEPS
    - `sport`: Le sport pour lequel vous souhaitez réserver un terrain (ex: "Tennis") **IMPORTANT**: Doit Débuter par une **MAJUSCULE**
    - `partner_ni1`: Le NI (numéro d'identification) de votre premier partenaire de réservation (nombre de 9 chiffres)
    - `partner_ni2`: Le NI de votre deuxième partenaire de réservation (optionnel)
    - `partner_ni3`: Le NI de votre troisième partenaire de réservation (optionnel)
    - `date`: Un objet contenant les informations de la date de réservation
        - `time`: L'heure de la réservation au format "HH:MM" (ex: "06:30")
        - `day`: Le jour de la réservation (ex: "21")
        - `month`: Le mois de la réservation au format "MM" (ex: "03")
        - `year`: L'année de la réservation (ex: "2024")
2. **Exécution:** Exécutez le script en utilisant `node main.js`.
3. **Connexion:** Le script se connecte automatiquement au portail de réservation PEPS en utilisant les informations de votre compte configurées dans `config.json`.
4. **Sélection de la date:** Le script sélectionne la date de réservation spécifiée dans `config.json`. Si la date est invalide (passée), le script s'arrêtera avec un message d'erreur.
5. **Sélection du sport:** Le script sélectionne le sport spécifié dans `config.json`. Si le sport n'est pas disponible pour la date sélectionnée, le script s'arrêtera avec un message d'erreur. À noter que la réservation pour le volleyball n'est pas disponible pour le moment
6. **Sélection du créneau horaire:** Le script recherche un créneau horaire correspondant à l'heure spécifiée dans `config.json`. Si l'heure n'est pas disponible, le script s'arrêtera avec un message d'erreur.
7. **Sélection des partenaires:** Le script sélectionne le premier partenaire de réservation en utilisant le NI fourni dans `config.json`. Si deux autres NI de partenaires supplémentaires sont fournis, le script les sélectionnera également. Si un NI de partenaire est invalide, le script s'arrêtera avec un message d'erreur.
8. **Confirmation de réservation:** Le script confirme la réservation du terrain.

**Prérequis**

- Node.js et npm installés sur votre machine
- Installation des packages avec la commande `npm install`
- Ajout d'un fichier de configuration nommé `config.json` comme mentionné plus haut selon l'exemple donné dans le fichier `config-exemple.json`

**Notes**

- Ce script est fourni à titre informatif seulement et ne doit pas être utilisé pour outrepasser les politiques de réservation du PEPS.
- L'utilisation de ce script se fait à vos propres risques. Le PEPS pourrait bloquer votre compte si un comportement anormal est détecté.
