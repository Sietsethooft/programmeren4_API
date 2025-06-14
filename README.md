# Share-a-Meal API

**Share-a-Meal** is een RESTful API ontwikkeld in Node.js die gebruikers in staat stelt om samen maaltijden te delen.
Gebruikers kunnen zich registreren, maaltijden aanbieden of eraan deelnemen.
Dit project heb ik opgezet als onderdeel van de module Programmeren 4 van Avans Hogeschool.

## Inhoudsopgave

- [Beschrijving](#beschrijving)
- [Technologieën](#technologieën)
- [Installatie](#installatie)

## Beschrijving

Share-a-Meal helpt mensen verbinding te maken door samen te eten. De backend-API ondersteunt:

- Registreren en beheren van gebruikers
- Toevoegen en beheren van maaltijden
- Toevoegen en beheren van aanmeldingen
- JWT-authenticatie
- Validatie van inputvelden
- Hashing/salting van wachtwoorden
- CI/CD straat
- Testen die alle api endpoints valideren.

## Technologieën

- Node.js
- Express.js
- MySQL (via XAMPP)
- JWT voor authenticatie
- Bycrypt
- Mocha
- Chai

## Installatie

1. Clone deze repository:

```bash
git clone https://github.com/jouwgebruikersnaam/share-a-meal.git
cd share-a-meal
```

2. Installeer de dependencies

```bash
npm install
```

3. Maak een .env bestand aan

4. Voeg volgende attributen toe aan .env bestand:

```bash
- PORT
- DB_HOST
- DB_PORT
- DB_USER
- DB_NAME
- LOGLEVEL
- JWT_SECRET
```

5. Start de applicatie:

```bash
npm start
```
