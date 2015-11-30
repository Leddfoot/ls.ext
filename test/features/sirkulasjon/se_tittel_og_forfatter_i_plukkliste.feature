# encoding: UTF-8
# language: no

@wip
Egenskap: Se tittel og forfatter i plukkliste
  Som bibliotekar
  For at jeg skal kunne vite hvilke bøker jeg skal hente
  Må plukklisten inneholde tittel og forfatter

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker
    Og at jeg er i katalogiseringsgrensesnittet

  Scenario: Finn utgivelsestittel og forfatter i Koha
    Gitt at det finnes et verk med person og en utgivelse
    Når jeg besøker bokposten
    Så ser jeg tittelen i bokposten
    Og ser jeg forfatteren i bokposten

  Scenario: Sjekker plukkliste
    Gitt at det finnes et verk med person og en utgivelse
    Og jeg ser på utgivelsen i katalogiseringsgrensesnittet
    Og jeg følger lenken til posten i Koha
    Og jeg oppretter et eksemplar av utgivelsen
    Og at det finnes en reservasjon på materialet
    Så ser jeg tittelen i plukklisten
    Og ser jeg forfatteren i plukklisten

  Scenario: Finn endret utgivelsestittel i Koha
    Gitt at det finnes et verk med person og en utgivelse
    Og jeg besøker bokposten
    Så ser jeg tittelen i bokposten
    Når jeg åpner utgivelsen for redigering
    Og når jeg endrer tittelen på utgivelsen
    Og jeg besøker bokposten
    Så ser jeg tittelen i bokposten

  Scenario: Finn endret utgivelsestittel i Koha (utgivelse uten verk)
    Gitt at det finnes en utgivelse uten verk
    Og jeg besøker bokposten
    Så ser jeg tittelen i bokposten
    Når jeg åpner utgivelsen for redigering
    Og når jeg endrer tittelen på utgivelsen
    Og jeg besøker bokposten
    Så ser jeg tittelen i bokposten

  Scenario: Finn byttet forfatter i Koha
    Gitt at det finnes et verk med person og en utgivelse
    Og jeg besøker bokposten
    Så ser jeg forfatteren i bokposten
    Gitt at det finnes en personressurs
    Når jeg åpner verket for redigering
    Og jeg endrer forfatteren på verket
    Og jeg besøker bokposten
    Så ser jeg forfatteren i bokposten

  Scenario: Finn forfatter med endret navn i Koha
    Gitt at det finnes et verk med person og en utgivelse
    Og jeg besøker bokposten
    Så ser jeg forfatteren i bokposten
    Når jeg åpner personen for redigering
    Og når jeg endrer navnet på personen
    Og jeg besøker bokposten
    Så ser jeg forfatteren i bokposten

  Scenario: Finn utgivelsestittel og forfatter i Koha på migrert utgivelse
    Gitt at det finnes et verk med person
    Og jeg migrerer en utgivelse med tilknyttet verk som har tittel og forfatter
    Og jeg sjekker om tittelen finnes i MARC-dataene til utgivelsen
    Og jeg sjekker om forfatteren finnes i MARC-dataene til utgivelsen
    Og jeg besøker bokposten
    Så ser jeg tittelen i bokposten
    Og ser jeg forfatteren i bokposten

  Scenario: Finn utgivelsestittel og forfatter i Koha på migrert utgivelse med items
    Gitt at det finnes et verk med person
    Og jeg migrerer en utgivelse med tilknyttet verk som har tittel, forfatter og items
    Og jeg sjekker om tittelen finnes i MARC-dataene til utgivelsen
    Og jeg sjekker om forfatteren finnes i MARC-dataene til utgivelsen
    Og jeg besøker bokposten
    Så ser jeg tittelen i bokposten
    Og ser jeg forfatteren i bokposten
