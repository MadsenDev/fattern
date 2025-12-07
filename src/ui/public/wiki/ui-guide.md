# Grensesnittguide

Forstå Fatterns brukergrensesnitt og vanlige interaksjoner.

## Oppsett

Fattern bruker et desktop-optimalisert oppsett:

- **Sidepanel**: Fast på venstre side, inneholder navigasjon
- **Hovedinnhold**: Rullebart område til høyre
- **Full bredde**: Appen bruker full vindusbredde (ikke sentrert)

## Sidepanel

Sidepanelet er alltid synlig og inneholder:
- **Logo/Monogram**: Fattern-merkevare på toppen
- **Navigasjonselementer**: Hovedseksjoner i appen
- **Arbeidsflyt-snarveier**: Hurtighandlinger (kommer snart)

Sidepanelet er fast og ruller ikke med hovedinnholdet.

## Modaler

Fattern bruker tilpassede modaler i stedet for nettleserdialoger:

### Standardmodal
- Brukes til skjemaer (opprett/rediger)
- Har en tittel og beskrivelse
- Bunntekst med handlingsknapper
- Klikk utenfor eller "Avbryt" for å lukke

### Bekreftelsesmodal
- Brukes til slettingsbekreftelser
- Kan ha flere handlingsknapper:
  - **Avbryt**: Lukk uten handling
  - **Deaktiver**: Tryggere alternativ (når tilgjengelig)
  - **Slett**: Bekreft destruktiv handling
- Fargekodede knapper (fare = rød, advarsel = rav)

## Datofelter

Alle datofelter:
- Format: **dd.mm.yyyy** (dag.måned.år)
- Autoformatering: Prikker legges til automatisk mens du skriver
- Eksempel: Skriv "01012024" → blir "01.01.2024"
- Datoer lagres i ISO-format internt

## Visningsvekslere

Noen sider (Produkter, Kunder) har visningsvekslere:
- **Liste**: Tabellvisning med alle detaljer
- **Kort**: Rutenettvisning med bilder

Vekslerknapper er i sidehodet, ved siden av "Ny"-knappen.

## Tabellsortering

Alle tabeller (Fakturaer, Utgifter, Produkter, Kunder) støtter sortering:
- **Klikk på kolonneoverskrift** for å sortere
- **Første klikk**: Stigende sortering (A-Z, 0-9, eldste først)
- **Andre klikk**: Synkende sortering (Z-A, 9-0, nyeste først)
- **Visuell indikator**: Sorterte kolonner viser fargede piler (opp/ned)
- **Standard sortering**: Noen tabeller har forhåndsinnstilt sortering (f.eks. fakturaer sorteres etter dato som standard)

## Statusmerker

Status vises med fargekodede merker:
- **Aktiv**: Grønn/blå merke
- **Inaktiv**: Grå merke
- Statusmerker vises i tabeller og kort

## Bildeopplasting

Når du laster opp bilder:
- Klikk på opplastingsområdet eller dra og slipp
- Støttet: JPG, PNG, GIF
- Maksimal størrelse: 5MB
- Forhåndsvisning vises umiddelbart
- Klikk X for å fjerne

## Tilpassede velgere

Tilpassede velgerkomponenter:
- Bygget med divs (ikke native select)
- Mer tilpassbar design
- Nedtrekksmeny åpnes ved klikk
- Klikk utenfor for å lukke
- Noen velgere støtter tilpassede verdier

## Tastatursnarveier

Foreløpig fokuserer Fattern på mus/sporplatte-interaksjon. Tastatursnarveier kommer snart.

## Responsivt design

Fattern er optimalisert for desktop:
- Minimum vindusstørrelse: 1024px bredde anbefales
- Sidepanel kollapser på mindre skjermer (kommer snart)
- Kortrutenett justerer kolonner basert på skjermstørrelse

## Tips

- Bruk kortvisning for visuell gjennomgang
- Bruk listevisning for detaljert sammenligning
- Modaler kan lukkes med Escape-tasten (kommer snart)
- Alle datoer bruker norsk format (dd.mm.yyyy)
