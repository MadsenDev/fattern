# Fakturaguide

Administrer fakturaene dine i Fattern.

## Vise fakturaer

Naviger til **Fakturaer** fra sidepanelet for å se alle fakturaene dine i en tabellvisning.

## Fakturatabell

Fakturatabellen viser:
- **Fakturanummer**: Unik fakturaidentifikator
- **Kunde**: Kundens navn
- **Status**: Nåværende fakturastatus med ikoner
- **Dato**: Fakturadato (formatert som dd.mm.yyyy)
- **Beløp**: Totalt fakturabeløp

### Sortering

Klikk på kolonneoverskriftene for å sortere fakturaene. Du kan sortere etter:
- Fakturanummer
- Kunde (alfabetisk)
- Status
- Dato (nyeste først som standard)
- Beløp

Klikk en gang for stigende sortering, klikk igjen for synkende sortering.

## Opprette fakturaer

1. Klikk på **Ny faktura**-knappen øverst på fakturasiden
2. Velg kunde i venstre panel
3. Fyll ut fakturadetaljer i midtpanel:
   - Fakturadato
   - Forfallsdato
   - Status
   - Kreditert (hvis relevant)
4. Legg til linjeelementer i høyre panel:
   - Velg produkt eller skriv inn manuell beskrivelse
   - Angi antall og pris
   - MVA beregnes automatisk
5. Klikk **Lagre** for å opprette fakturaen

## Redigere fakturaer

1. Klikk på rediger-ikonet (blyant) ved siden av fakturaen i listen
2. Gjør endringene du ønsker
3. Klikk **Lagre** for å oppdatere fakturaen

## Slette fakturaer

1. Klikk på søppel-ikonet ved siden av fakturaen
2. Bekreft slettingen i dialogboksen

## PDF-generering

1. Klikk på nedlastings-ikonet ved siden av fakturaen
2. PDF-en genereres og lagres i eksportmappen (`~/Fattern/exports/`)
3. PDF-en åpnes automatisk etter generering

Du kan også bruke tilpassede fakturamaler (se Innstillinger > Maler).

## Fakturastatus

Fakturaer kan ha forskjellige statuser:
- **Draft** (Utkast): Fakturaen forberedes
- **Sent** (Sendt): Fakturaen er sendt til kunde
- **Paid** (Betalt): Fakturaen er betalt
- **Overdue** (Forfalt): Fakturaen er forfalt
- **Cancelled** (Kansellert): Fakturaen er kansellert

Status vises med fargekodede merker og ikoner for enkel identifikasjon.

## Tips

- Bruk fakturalisten til å spore hvilke fakturaer som trenger oppmerksomhet
- Overvåk forfalte fakturaer på Dashboardet
- Sjekk fakturastatus regelmessig for å følge opp ubetalte fakturaer
- Sorter etter dato for å se de nyeste fakturaene først
- Sorter etter beløp for å identifisere de største fakturaene
