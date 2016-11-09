require 'cgi'
require_relative '../support/ssn.rb'

When(/^at jeg er i søkegrensesnittet$/) do
  @site.SearchPatronClient.visit
end

When(/^jeg søker på "([^"]*)" \(\+ id på vilkårlig migrering\)$/) do |query|
  @site.SearchPatronClient.search_with_text "#{query}#{@context[:random_migrate_id]}"
end

When(/^skal jeg få "([^"]*)" treff$/) do |hits|
  wait_retry { @site.SearchPatronClient.total_hits.eql? hits }
end

When(/^jeg går til side "([^"]*)" i resultatlisten$/) do |page|
  @site.SearchPatronClient.goto_search_result_page page
end

When(/^skal jeg ha "([^"]*)" resultater og være på side "([^"]*)"$/) do |hits, page|
  wait_retry { @browser.element(class: 'pagination').a(text: page).parent.class_name.eql? 'active' }
  wait_retry { @browser.element(data_automation_id: 'hits-total').exists? }
  wait_retry { @browser.div(data_automation_id: 'search-result-entries').elements(:xpath, '*').count.to_s.eql? hits }
end

When(/^jeg trykker tilbake i nettleseren$/) do
  sleep 1 # Avoids snags in PhantomJS
  @browser.back
end

When(/^jeg trykker fremover i nettleseren$/) do
  sleep 1 # Avoids snags in PhantomJS
  @browser.forward
end

When(/^jeg trykker oppfrisk i nettleseren$/) do
  @browser.refresh
end

When(/^skal jeg se filtre på format, språk og målgruppe$/) do
  wait_retry { @browser.element(data_automation_id: 'filter_format').exists? }
  wait_retry { @browser.element(data_automation_id: 'filter_language').exists? }
  wait_retry { @browser.element(data_automation_id: 'filter_audience').exists? }
end

When(/^jeg slår på et filter for et vilkårlig format$/) do
  # To get nice styling for checkboxes, they are effectively set to invisible while images are displayed in their place.
  # Watir does not allow interaction with invisible items, therefore clicking the parent (which has the click handler)
  @browser.element(data_automation_id: 'filter_format').checkboxes.to_a.select { |checkbox| not checkbox.set? }.sample.element(xpath: './following-sibling::*').click # The sibling is the label
end

When(/^skal jeg kun se treff med valgte format tilgjengelig$/) do
  wait_for { @browser.element(data_automation_id: 'filter_format').present? }
  filter_values = @browser.element(data_automation_id: 'filter_format').lis
                      .select { |li| li.checkbox.set? }
                      .map { |li| li.element(data_automation_id: 'filter_label').text }
  wait_retry {
    match = false
    @site.SearchPatronClient.get_search_result_list.each do |element|
      filter_values.each do |filter_value|
        if element.attribute_value('data-formats').include? filter_value
          match = true
        end
      end
    end
    match
  }
end

When(/^skal filterne være valgt i grensesnittet$/) do
  filters = CGI::parse(URI(@browser.url).query).select { |param| param.start_with? 'filter_' }
  data_automation_ids = filters.map { |aggregation, buckets| buckets.map { |bucket| "#{aggregation}_#{bucket}" } }.flatten
  filters.each do |filter, _|
    element = @browser.element(data_automation_id: filter)
    element.lis.select do |filter|
      if data_automation_ids.include? filter.attribute_value(:data_automation_id)
        filter.checkbox.set?.should eq true
      end
    end
  end
end

When(/^nåværende søketerm skal være "([^"]*)" \(\+ id på vilkårlig migrering\)$/) do |query|
  @site.SearchPatronClient.search_term.eql?("#{query}#{@context[:random_migrate_id]}")
end

When(/^skal tittel prefikset "([^"]*)" og som inneholder "([^"]*)" vises i søkeresultatet$/) do |prefix, str|
  wait_retry {
    element = @browser.element(data_automation_id: 'work-title')
    element.present? && element.text.eql?("#{prefix}#{@context[:random_migrate_id]} #{@context[:random_migrate_id]}#{str}")
  }
end

When(/^skal språket "([^"]*)" være valgt$/) do |language|
  @site.PatronClientCommon.current_language?(language).should eq true
end

When(/^søkeknappen skal vise ordet "([^"]*)"$/) do |button_text|
  wait_retry { @browser.element(data_automation_id: 'search_button').text.eql? button_text }
end

When(/^jeg søker på "([^"]*)"$/) do |query|
  @site.SearchPatronClient.search_with_text "#{query}"
end

When(/^jeg trykker på første treff$/) do
  @site.SearchPatronClient.follow_first_item_in_search_result
end

When(/^skal jeg se "([^"]*)" utgivelser$/) do |count|
  wait_retry { @site.PatronClientWorkPage.publication_entries.size.to_s.eql? count }
end

When(/^skal jeg se et panel med informasjon om utgivelsen$/) do
  wait_retry { @browser.elements(data_automation_id: /^publication_info_/).size.eql? 1 } #There should only be one
end

When(/^jeg trykker på utgivelsen med "([^"]*)" språk$/) do |language|
  @browser.elements(data_automation_id: /^publication_http/).select { |element| element.elements(data_automation_id: 'publication_languages').select { |element| element.text.include? language }[0] }[0].button(data_automation_id: 'publication_open_show_more_info').click
end

When(/^den skal inneholde eksemplarinformasjonen$/) do |table|
  table = table.hashes.sort_by { |r| r.to_s }
  table.each do |row|
    if row['Filial'].eql? 'random_migrate_branchcode'
      row['Filial'] = @context[:random_migrate_branchcode]
    end
  end
  wait_retry { @browser.element(data_automation_id: /^publication_info_/).present? }
  publication_info = @browser.element(data_automation_id: /^publication_info_/).table.hashes.sort_by { |r| r.to_s }
  table.should eq publication_info
end

When(/^skal jeg ikke se et panel med informasjon om utgivelsen$/) do
  wait_retry { @browser.elements(data_automation_id: /^publication_info_/).size.eql? 0 }
end

When(/^skal skal tittel prefikset "([^"]*)" og som inneholder "([^"]*)" vises på verkssiden$/) do |prefix, str|
  @site.PatronClientWorkPage.title.eql?("#{prefix}#{@context[:random_migrate_id]} #{@context[:random_migrate_id]}#{str}")
end

When(/^jeg trykker for å lukke utgivelsesinformasjon$/) do
  @browser.element(data_automation_id: 'publication_close_show_more_info').click
end

When(/^jeg går til Min Side$/) do
  @site.PatronClientProfilePage.visit
end

When(/^skal jeg se innloggingsvinduet$/) do
  @site.PatronClientCommon.login_modal_visible?.should eq true
end

When(/^jeg logger inn$/) do
  @site.PatronClientCommon.login(@active[:patron].userid, @active[:patron].password)
end

When(/^skal jeg se informasjonen min$/) do
  @site.PatronClientProfilePage.card_number.should eq @active[:patron].cardnumber
end

When(/^låneren trykker bestill på en utgivelse$/) do
  record_id = @site.PatronClientWorkPage.click_first_reserve
  @context[:reserve_record_id] = record_id
end

When(/^skal jeg se reservasjonsvinduet$/) do
  wait_for { @site.PatronClientCommon.reservation_modal_visible? }
end

When(/^jeg trykker på bestill$/) do
  @browser.element(data_automation_id: 'reserve_button').click
end

When(/^får låneren tilbakemelding om at boka er reservert$/) do
  wait_for { @site.PatronClientCommon.reservation_success_modal_visible? }
end

When(/^jeg trykker for å bytte språk$/) do
  @site.PatronClientCommon.click_change_language
end

When(/^jeg velger riktig avdeling$/) do
  # Temporary hack to set the branch code to the test branch
  # Will be fixed when Patron Client can retrieve a list of existing branches from Koha
  @browser.execute_script("document.querySelector('[data-automation-id=\"reservation_modal\"]').getElementsByTagName('option')[0].setAttribute('value', \"#{@context[:random_migrate_branchcode]}\")")
end

When(/^jeg går til Lån og reservasjoner på Min Side$/) do
  @browser.goto(patron_client(:loansAndReservations))
end

When(/^skal jeg se reservasjonen$/) do
  wait_for {
    reservations = @site.PatronClientLoansAndReservationsPage.reservations
    reservations.size.eql?(1) && reservations.first.attribute_value('data-recordid').eql?(@context[:reserve_record_id])
  }
end

When(/^jeg trykker på personopplysninger$/) do
  @browser.element(data_automation_id: 'tabs').element(:text, 'Personopplysninger').click
end

When(/^skal jeg se at boka er klar til å hentes$/) do
  wait_for {
    pickups = @site.PatronClientLoansAndReservationsPage.pickups
    pickups.size.eql?(1) && pickups.first.attribute_value('data-recordid').eql?(@context[:reserve_record_id])
  }
end

When(/^det skal ikke være bøker klare til avhenting eller i historikk$/) do
  @site.PatronClientLoansAndReservationsPage.loans.size.should eq 0
  @site.PatronClientLoansAndReservationsPage.pickups.size.should eq 0
end

When(/^skal jeg se at boka er utlånt$/) do
  wait_for {
    loans = @site.PatronClientLoansAndReservationsPage.loans
    loans.size.eql?(1) && loans.first.attribute_value('data-recordid').eql?(@context[:reserve_record_id])
  }
end

When(/^jeg trykker på forleng lånet$/) do
  @context[:reserve_due_date] = @browser.element(data_automation_id: 'UserLoans_loan_dueDate').text
  @site.PatronClientLoansAndReservationsPage.loans.first.button.click
  wait_for { @browser.element(data_automation_id: 'extend_loan_modal').present? }
end

When(/^jeg bekrefter at jeg skal forlenge lånet$/) do
  @browser.element(data_automation_id: 'confirm_button').click
  wait_for { @browser.element(data_automation_id: 'extend_loan_success_modal').present? }
  @browser.element(data_automation_id: 'extend_loan_success_modal').button.click
  wait_for { not @browser.element(data_automation_id: 'extend_loan_success_modal').present? }
end

When(/^skal jeg se en dato lenger frem i tid$/) do
  wait_for { Date.parse(@browser.element(data_automation_id: 'UserLoans_loan_dueDate').text) > Date.parse(@context[:reserve_due_date]) }
end

When(/^jeg trykker på avbestill reservasjon$/) do
  @site.PatronClientLoansAndReservationsPage.reservations.first.button.click
  wait_for { @browser.element(data_automation_id: 'cancel_reservation_modal').present? }
end

When(/^jeg bekrefter at jeg skal avbestille reservasjonen$/) do
  @browser.element(data_automation_id: 'confirm_button').click
  wait_for { @browser.element(data_automation_id: 'cancel_reservation_success_modal').present? }
  @browser.element(data_automation_id: 'cancel_reservation_success_modal').button.click
  wait_for { not @browser.element(data_automation_id: 'cancel_reservation_success_modal').present? }
end

When(/^skal jeg ikke ha noen reservasjoner$/) do
  wait_for { @site.PatronClientLoansAndReservationsPage.reservations.size.eql? 0 }
end

When(/^jeg går til innstillinger$/) do
  @browser.element(data_automation_id: 'tabs').element(text: 'Innstillinger').click
end

When(/^slår på alle avkrysningsboksene inne på innstillinger$/) do
  @browser.checkboxes(data_automation_id: /^UserSettings_/).each do |checkbox|
    CheckboxHelper.new(@browser).set(checkbox.attribute_value('data-automation-id'))
  end
end

When(/^jeg trykker lagre inne på innstillinger$/) do
  @browser.element(data_automation_id: 'UserSettings_saveButton').click
  sleep 1 # TODO: Fix visual response in UI that signalizes successful save that we can wait for
end

When(/^skal alle avkrysningsboksene være skrudd på inne på innstillinger$/) do
  wait_for { @browser.checkboxes(data_automation_id: /^UserSettings_/).size > 0 }
  @browser.checkboxes(data_automation_id: /^UserSettings_/).each do |checkbox|
    checkbox.set?.should eq true
  end
end

When(/^jeg skrur av alle avkrysningsnboksene inne på innstillinger$/) do
  @browser.checkboxes(data_automation_id: /^UserSettings_/).each do |checkbox|
    CheckboxHelper.new(@browser).set(checkbox.attribute_value('data-automation-id'), false)
  end
end

When(/^skal ingen av avkrysningsboksene være skrudd på inne på innstillinger$/) do
  wait_for { @browser.checkboxes(data_automation_id: /^UserSettings_/).size > 0 }
  @browser.checkboxes(data_automation_id: /^UserSettings_/).each do |checkbox|
    checkbox.set?.should eq false
  end
end

Given(/^at det finnes en person som ikke er låner$/) do
  step "at jeg har mottatt opplysninger om en låner"
end

When(/^jeg trykker på logg inn$/) do
  @browser.element(data_automation_id: 'login_element').click
end

When(/^jeg trykker på registreringslenken$/) do
  @browser.element(data_automation_id: 'registration_link').click
end

When(/^skal jeg se registreringsskjemaet$/) do
  @site.PatronClientCommon.registration_modal_visible?.should eq true
end

When(/^jeg legger inn mine personalia som "(barn|voksen)"$/) do |category|
  juvenile_age = (Time.now - (60*60*24*365*8)).year # ~8 years
  adult_age = (Time.now - (60*60*24*365*40)).year # ~40 years

  @browser.text_field(id: 'firstName').set generateRandomString
  @browser.text_field(id: 'lastName').set @active[:patron].surname
  @browser.text_field(id: 'day').set '%02d' % (rand(29)+1)
  @browser.text_field(id: 'month').set '%02d' % (rand(11)+1)
  @browser.text_field(id: 'year').set category == 'barn' ? juvenile_age : adult_age
  @browser.text_field(id: 'ssn').set SSN.generate(category == 'barn' ? juvenile_age : adult_age)
end

When(/^jeg trykker på knappen for å sjekke om jeg er registrert fra før$/) do
  wait_for { @browser.element(data_automation_id: 'check_existing_user_button').enabled? }
  @browser.element(data_automation_id: 'check_existing_user_button').click
end

Then(/^får jeg opp resten av registreringsskjemaet$/) do
  wait_for { @browser.element(data_automation_id: 'register_button').present? }
end

When(/^jeg fyller inn resten av skjemaet$/) do
  @browser.text_field(name: 'email').set @active[:patron].email
  @browser.text_field(name: 'mobile').set '%08d' % rand(10**8)
  @browser.text_field(name: 'address').set generateRandomString
  @browser.text_field(name: 'zipcode').set '%04d' % rand(10000)
  @browser.text_field(name: 'city').set (0...8).map { (65 + rand(26)).chr }.join
  #@browser.select_list(data_automation_id: 'gender_selection').select_value 'female' # TODO: Must be fixed in patron-client
  @browser.text_field(name: 'pin').set '1234'
  @browser.text_field(name: 'repeatPin').set '1234'
end

When(/^jeg godtar lånerreglementet$/) do
  # Need to hijack element because watir refuses to click hidden elements (checkbox hidden due to styling)
  @browser.execute_script("document.getElementById('acceptTerms').click()")
end

When(/^jeg trykker på registreringsknappen$/) do
  wait_for { @browser.element(data_automation_id: 'register_button').enabled? }
  @browser.element(data_automation_id: 'register_button').click
end

Then(/^får jeg tilbakemelding om at registreringen er godkjent$/) do
  wait_for { @browser.element(data_automation_id: 'registration_success_modal').present? }
end

Then(/^jeg har fått riktig lånerkategori som "(barn|voksen)"$/) do |category|
  if category == 'barn'
    @browser.element(data_automation_id: 'category').class_name.should eq('juvenile')
  else
    @browser.element(data_automation_id: 'category').class_name.should eq('adult')
  end
end

Then(/^jeg har fått et midlertidig brukernavn$/) do
  @active[:patron].userid = @browser.element(data_automation_id: 'username').text
  @active[:patron].userid.should_not be_empty
end

Then(/^jeg kan søkes opp i systemet som låner$/) do
  @site.Patrons.visit.search @active[:patron].surname
  @browser.div(class: 'patroninfo').text.should include(@active[:patron].surname)
end

When(/^utgivelsene skal være sortert på språk \(med norsk, engelsk, dansk og svensk først\), utgivelsesår og format$/) do
  publications = @site.PatronClientWorkPage.publication_entries('http://data.deichman.no/mediaType#Book')

  def check(element, prefix, postfix)
    text = element.element(data_automation_id: 'publication_title').text
    (text.start_with?(prefix) && text.end_with?(postfix)).should eq true
  end

  check(publications[0], 'pubprefix0', 'nob')
  check(publications[1], 'pubprefix1', 'eng')
  check(publications[2], 'pubprefix0', 'eng')
  check(publications[3], 'pubprefix0', 'swe')
  check(publications[4], 'pubprefix1', 'dan')
  check(publications[5], 'pubprefix3', 'cze')
  check(publications[6], 'pubprefix2', 'cze')
  check(publications[7], 'pubprefix1', 'cze')
  check(publications[8], 'pubprefix0', 'cze')
end

When(/^skal utgivelsene være inndelt etter medietype$/) do
  book_count = @site.PatronClientWorkPage.publication_entries('http://data.deichman.no/mediaType#Book').size
  book_count.should eq 9
  music_recording_count = @site.PatronClientWorkPage.publication_entries('http://data.deichman.no/mediaType#MusicRecording').size
  music_recording_count.should eq 1
  uncategorized_count = @site.PatronClientWorkPage.publication_entries('Publications.noMediaType').size
  @site.PatronClientWorkPage.publication_entries.size.should eq(book_count + music_recording_count + uncategorized_count)
end

When(/^jeg fyller inn gammel PIN og ny PIN riktig$/) do
  @browser.element(data_automation_id: 'changePin_currentPin').to_subtype.set(@active[:patron].password)
  @browser.element(data_automation_id: 'changePin_newPin').to_subtype.set('8888')
  @browser.element(data_automation_id: 'changePin_repeatPin').to_subtype.set('8888')
  @active[:patron].password = '8888'
end

When(/^trykker på endre PIN\-kode$/) do
  @browser.element(data_automation_id: 'changePinForm_button').click
end

When(/^skal jeg se at PIN\-koden har blitt endret$/) do
  wait_for { @browser.element(data_automation_id: 'changePinForm_success').present? }
end

When(/^jeg logger ut$/) do
  @site.PatronClientCommon.logout
end

When(/^jeg trykker logg inn$/) do
  @site.PatronClientCommon.login
end

When(/^jeg trykker på registrer deg$/) do
  @browser.element(data_automation_id: 'registration_element').click
end
