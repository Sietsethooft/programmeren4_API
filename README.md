# Share-a-Meal API

**Share-a-Meal** is een RESTful API ontwikkeld in Node.js die gebruikers in staat stelt om samen maaltijden te delen.
Gebruikers kunnen zich registreren, maaltijden aanbieden of eraan deelnemen.
Dit project heb ik opgezet als onderdeel van de module Programmeren 4 van Avans Hogeschool.

## Inhoudsopgave

- [Beschrijving](#beschrijving)
- [Technologieën](#technologieën)
- [Installatie](#installatie)
- [Gebruik](#gebruik)
- [API Endpoints](#api-endpoints)
- [Authenticatie](#authenticatie)
- [Validatie](#validatie)
- [Testen](#testen)
- [Ontwikkelstraat en CI/CD](#ontwikkelstraat-en-cicd)

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

## Gebruik

Je kunt deze API testen met Postman of een andere REST client. Alle beveiligde routes vereisen een geldig JWT-token.

### Voorbeeld login:

```bash
POST /api/login
{
  "emailAddress": "j.smith@student.avans.nl",
  "password": "Secret12"
}
```

### Response:

```json
{
  "status": 200,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 49,
      "firstName": "Jan",
      "lastName": "Smith",
      "isActive": 1,
      "emailAdress": "j.smith@student.avans.nl",
      "password": "$2b$10$PUKsN4vJ3tChtSKWMvKrT.Wwi/t2qC/1qKhu8PGGyps4MmHmGwl86",
      "phonenumber": "06-87654321",
      "street": "Keizersgracht 12",
      "city": "Amsterdam"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ5LCJlbWFpbEFkcmVzcyI6ImQudmVybWVlckBob3RtYWlsLmNvbSIsImlhdCI6MTc0OTkzNDU1NywiZXhwIjoxNzQ5OTM4MTU3fQ.ROGDAMEHeCWfixgiVjDPEDWQINtNZhzQta-ttZm76Fc"
  }
}
```

## API Endpoints

### Gebruikers:

```bash
POST   /api/user                      # Registreren
GET    /api/user                      # Overzicht van alle users
GET    /api/user?field1=:value1       # Overzicht van alle users met filter
GET    /api/user/profile              # Eigen profielgegevens
GET    /api/user/:userId              # Gegevens van een specifieke user
PUT    /api/user/:userId              # Wijzigen van usergegevens
DELETE /api/user/:userId              # Verwijderen van een user
```

### Maaltijden:

```bash
POST   /api/meal                      # Toevoegen van een maaltijd
GET    /api/meal                      # Lijst van alle maaltijden
GET    /api/meal/:mealId              # Details van een maaltijd
PUT    /api/meal/:mealId              # Wijzigen van maaltijdgegevens
DELETE /api/meal/:mealId              # Verwijderen van een maaltijd
```

### Deelname:

```bash
POST   /api/meal/:mealId/participate                 # Aanmelden voor maaltijd
DELETE /api/meal/:mealId/participate                 # Afmelden voor maaltijd
GET    /api/meal/:mealId/participants                # Lijst van deelnemers
GET    /api/meal/:mealId/participants/:participantId # Detail van een deelnemer
```

### Overig:

```bash
POST   /api/login                     # Inloggen
GET    /api/info                      # Info krijgen van de API
```

## Authenticatie

Alle endpoints (naast registreren, inloggen en meal bekijken) vereisen een JWT-token in de headers:

```bash
Authorization: Bearer <token>
```

## Validatie

- **E-mail:** n.lastname@domain.com (n = max 1 letter, lastname >= 2)
- **Wachtwoord:** Minimaal 8 tekens, 1 hoofdletter en 1 cijfer
- **Telefoonnummer:** Begint met 06, bevat totaal 10 cijfers

## Testen

Dit systeem bevat een uitgebreide set van testcases op basis van alle usecases en functioneel ontwerp.
De testen worden automatisch uitgevoerd via een CI/CD pipeline en valideren de statuscode, inhoud van de responses en foutafhandeling.

## Ontwikkelstraat en CI/CD

- GitLab wordt gebruikt met feature-branches, development- en master-branch. Daarbij ook een release branch voor de releases.
- Elke commit in de release branch activeert automatische testen.
- Bij succesvolle tests wordt automatisch gedeployed naar de cloudomgeving.
