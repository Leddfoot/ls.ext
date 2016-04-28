# encoding: UTF-8
# language: no

@patron_client
@random_migrate
@redef
Egenskap: Gå gjennom lånegrensesnittet
  Som bruker av bibliotekets websider
  Skal jeg kunne søke på verk
  Og kunne filtrere søkeresultatene
  Og kunne paginere søkeresultatene

  Scenario: Filtrere søkeresultater
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "prefix0" (+ id på vilkårlig migrering)
    Så nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Og skal jeg se filtre på format, språk og målgruppe
    Når jeg slår på et filter for et vilkårlig format
    Så skal filterne være valgt i grensesnittet
    Og skal jeg kun se treff med valgte format tilgjengelig
    Når jeg slår på et filter for et vilkårlig format
    Så skal filterne være valgt i grensesnittet
    Og skal jeg kun se treff med valgte format tilgjengelig
    Når jeg trykker tilbake i nettleseren
    Så skal jeg kun se treff med valgte format tilgjengelig
    Når jeg trykker fremover i nettleseren
    Så skal jeg kun se treff med valgte format tilgjengelig

  Scenario: Paginere søkeresultater
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "prefix0" (+ id på vilkårlig migrering)
    Så skal jeg få "16" treff
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg går til side "1" i resultatlisten
    Så skal jeg ha "10" resultater og være på side "1"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg går til side "2" i resultatlisten
    Så skal jeg ha "6" resultater og være på side "2"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg trykker tilbake i nettleseren
    Så skal jeg ha "10" resultater og være på side "1"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg trykker fremover i nettleseren
    Så skal jeg ha "6" resultater og være på side "2"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)
    Når jeg søker på "prefix1" (+ id på vilkårlig migrering)
    Så nåværende søketerm skal være "prefix1" (+ id på vilkårlig migrering)
    Når jeg trykker tilbake i nettleseren
    Så skal jeg ha "6" resultater og være på side "2"
    Og nåværende søketerm skal være "prefix0" (+ id på vilkårlig migrering)

  Scenario: Vise ulike titler på verk avhengig av søketerm
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Så skal tittel prefikset "pubprefix0" og som inneholder "nob" vises i søkeresultatet
    Når jeg trykker på første treff
    Så skal skal tittel prefikset "pubprefix0" og som inneholder "nob" vises på verkssiden
    Når jeg søker på "pubprefix1" (+ id på vilkårlig migrering)
    Så skal tittel prefikset "pubprefix1" og som inneholder "eng" vises i søkeresultatet
    Når jeg trykker på første treff
    Så skal skal tittel prefikset "pubprefix1" og som inneholder "eng" vises på verkssiden

  Scenario: Velge språk
    Gitt at jeg er i søkegrensesnittet
    Så skal språket "Norsk" være valgt
    Og søkeknappen skal vise ordet "SØK"
    Når jeg trykker for å bytte språk
    Så søkeknappen skal vise ordet "SEARCH"
    Og skal språket "English" være valgt
    Når jeg trykker oppfrisk i nettleseren
    Så skal språket "English" være valgt
    Og søkeknappen skal vise ordet "SEARCH"

  Scenario: Se informasjon om utgivelse
    Gitt at jeg er i søkegrensesnittet
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Og jeg trykker på første treff
    Så skal jeg se "4" utgivelser
    Når jeg trykker på utgivelsen med "Norsk (bokmål)" språk
    Så skal jeg se et panel med informasjon om utgivelsen
    Og den skal inneholde eksemplarinformasjonen
      | filial                    | antall | plassering | status               |
      | random_migrate_branchcode | 2      | placement1 | Ledig                |
      | random_migrate_branchcode | 1      | placement2 | Forventet 2011-06-20 |
    Når jeg trykker på krysset i boksen med utgivelsesinformasjon
    Så skal jeg ikke se et panel med informasjon om utgivelsen
    Når jeg trykker på utgivelsen med "Dansk" språk
    Så skal jeg se et panel med informasjon om utgivelsen
    Og den skal inneholde eksemplarinformasjonen
      | filial                    | antall | plassering | status               |
      | random_migrate_branchcode | 1      | placement1 | Forventet 2011-06-20 |
    Når jeg trykker oppfrisk i nettleseren
    Så den skal inneholde eksemplarinformasjonen
      | filial                    | antall | plassering | status               |
      | random_migrate_branchcode | 1      | placement1 | Forventet 2011-06-20 |
    Når jeg trykker tilbake i nettleseren
    Så skal jeg ikke se et panel med informasjon om utgivelsen
    Når jeg trykker fremover i nettleseren
    Så den skal inneholde eksemplarinformasjonen
      | filial                    | antall | plassering | status               |
      | random_migrate_branchcode | 1      | placement1 | Forventet 2011-06-20 |

  Scenario: Logge inn
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og brukeren har rettigheten "superlibrarian"
    Og at jeg er i søkegrensesnittet
    Når jeg går til Min Side
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Så skal jeg se informasjonen min

  @wip
  Scenario: Låner reserverer bok på verkssiden
    Gitt at jeg er logget inn som adminbruker
    Og at det finnes en låner med passord
    Og brukeren har rettigheten "superlibrarian"
    Og at jeg er i søkegrensesnittet
    Når jeg søker på "pubprefix0" (+ id på vilkårlig migrering)
    Og jeg trykker på første treff
    Og låneren trykker bestill på en utgivelse
    Så skal jeg se innloggingsvinduet
    Når jeg logger inn
    Så skal jeg se reservasjonsvinduet
    Når jeg trykker på bestill
    Så får låneren tilbakemelding om at boka er reservert