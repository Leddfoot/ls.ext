# encoding: UTF-8
# language: no

Egenskap: Varsling på epost
  Som en bruker
  Siden jeg liker å holde meg oppdatert
  Ønsker jeg å kunne motta varsler fra biblioteket

  Bakgrunn:
    Gitt at jeg er pålogget som adminbruker
    Og at det finnes en låner med lånekort
      | firstname | dateenrolled | dateexpiry | gonenoaddress | lost  | debarred | password | flags | email          |
      | Knut      | 01/08/2015   | 01/01/2020 | 0             | 0     | false    | 1234     | 0     | knut@knutby.no |
    Og et verk med en utgivelse og et eksemplar

  Scenario: Epost om reservert tittel som er klar til avhenting
    Gitt at meldingstyper er aktivert for låneren
    Og at bok er reservert av låner
    Og boka sjekkes inn på låners henteavdeling
    Og det bekreftes at boka skal holdes av
    Så vil låneren få epost om at boka er klar til avhenting

  @wip
  Scenario: Epost om bok som skulle vært levert
    Gitt at eksemplaret er utlånt til en låner
    Så vil låneren få epost om at boka skulle vært levert på forfallsdato
