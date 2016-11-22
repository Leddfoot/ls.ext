# encoding: UTF-8
# language: no

@patron_client
@redef
Egenskap: Min Side
  Som bruker
  Ønsker jeg å kunne se og endre personlige opplysninger og innstillinger

  Scenario: Se og redigere personopplysninger
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og at jeg er i søkegrensesnittet
    Når jeg går til Min Side
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Og jeg trykker på personopplysninger
    Når jeg trykker på endre personopplysninger
    Så skal jeg se et skjema med personopplysninger
    Og jeg sjekker om epost og mobil/telefon valideres riktig
    Og jeg sjekker om postnummer valideres riktig
    Og jeg tester adresse for påkrevd og XSS
    Og jeg sjekker at poststed valideres riktig
    Og jeg fyller ut personopplysningene mine riktig
    Og jeg trykker på lagre personopplysninger
    Så skal jeg se personopplysningene mine

  Scenario: Bytte PIN
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og at jeg er i søkegrensesnittet
    Når jeg går til Min Side
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Og jeg går til innstillinger
    Og jeg fyller inn gammel PIN og ny PIN riktig
    Og trykker på endre PIN-kode
    Så skal jeg se at PIN-koden har blitt endret
    Når jeg logger ut
    Når jeg trykker logg inn
    Så skal jeg se innloggingsvinduet
    Og jeg logger inn

  Scenario: Låner endrer personlige innstillinger
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og at jeg er i søkegrensesnittet
    Når jeg går til Min Side
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Og jeg går til innstillinger
    Når slår på alle avkrysningsboksene inne på innstillinger
    Og jeg trykker lagre inne på innstillinger
    Og jeg trykker oppfrisk i nettleseren
    Så skal alle avkrysningsboksene være skrudd på inne på innstillinger
    Når jeg skrur av alle avkrysningsnboksene inne på innstillinger
    Og jeg trykker lagre inne på innstillinger
    Og jeg trykker oppfrisk i nettleseren
    Så skal ingen av avkrysningsboksene være skrudd på inne på innstillinger