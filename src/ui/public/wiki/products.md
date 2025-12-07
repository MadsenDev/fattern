# Produktguide

Administrer produktkatalogen din i Fattern. Produkter er varer eller tjenester du selger til kunder.

## Vise produkter

Naviger til **Produkter** fra sidepanelet. Du kan vise produkter på to måter:

### Listevisning
- Tradisjonelt tabellformat
- Viser alle produktdetaljer i kolonner
- Best for å sammenligne flere produkter
- Rask tilgang til rediger/slett-handlinger

### Kortvisning
- Visuelt rutenett
- Viser produktbilder fremtredende
- Perfekt for å bla gjennom katalogen din
- Responsivt rutenett (2-4 kolonner basert på skjermstørrelse)

Veksle mellom visninger ved å bruke **Liste**- og **Kort**-knappene i sidehodet.

## Opprette et produkt

1. Klikk **Nytt produkt**-knappen
2. Fyll inn produktdetaljene:
   - **Produktnavn** *: Påkrevd
   - **SKU**: Lagerenhet (valgfritt)
   - **Beskrivelse**: Produktbeskrivelse (valgfritt)
   - **Pris** *: Enhetspris (påkrevd)
   - **MVA-sats**: Skattesats i prosent (standard: 25%)
   - **Enhet**: Måleenhet (f.eks. timer, stk, kg)
   - **Produktbilde**: Last opp et bilde (valgfritt)
   - **Produktet er aktivt**: Avkrysningsboks for å aktivere/deaktivere
3. Klikk **Opprett produkt**

### Enheter

Enhetsfeltet bruker en tilpasset velger med vanlige alternativer:
- timer
- stk (stykker)
- m² (kvadratmeter)
- kg, l, m, km
- dag, uke, måned, år

Du kan også velge "Tilpasset enhet" for å angi din egen.

## Redigere et produkt

1. I listevisning: Klikk **Rediger** i handlingskolonnen
2. I kortvisning: Klikk **Rediger**-knappen på produktkortet
3. Endre feltene etter behov
4. Klikk **Lagre endringer**

## Slette eller deaktivere et produkt

Når du klikker **Slett**, vil du se en bekreftelsesdialog med tre alternativer:

1. **Avbryt**: Lukk uten handling
2. **Deaktiver**: Anbefalt alternativ
   - Skjuler produktet fra aktive lister
   - Produktet forblir i databasen
   - Eksisterende fakturaer beholder produktreferansen
   - Kan aktiveres på nytt senere
3. **Slett**: Permanent sletting
   - Fjerner produktet fullstendig
   - Kan ikke angres
   - Kan ødelegge referanser i eksisterende fakturaer

**Anbefaling**: Bruk "Deaktiver" i stedet for "Slett" for å bevare dataintegritet.

## Produktbilder

- Støttede formater: JPG, PNG, GIF
- Maksimal størrelse: 5MB
- Bilder lagres i databasen
- Klikk X-knappen på forhåndsvisningen for å fjerne et bilde
- Bilder vises i kortvisning og kan brukes i fakturaer

## Produktstatus

Produkter kan være **Aktiv** eller **Inaktiv**:
- Aktive produkter vises i produktvalglister
- Inaktive produkter er skjult, men forblir i databasen
- Du kan veksle status når du redigerer

## Tips

- Bruk beskrivende produktnavn
- Legg til SKU-er for lagerstyring
- Last opp produktbilder for bedre visuell identifikasjon
- Bruk passende enheter for nøyaktig prising
- Deaktiver i stedet for å slette for å opprettholde fakturahistorikk
