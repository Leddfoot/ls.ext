# encoding: UTF-8
require 'csv'
require 'net/http'
require 'uri'
require_relative '../support/migration.rb'
 
Given(/^at en låner ikke finnes som låner hos biblioteket fra før$/) do
  steps %Q{
    Gitt at det finnes en lånerkategori
    Og at det finnes en avdeling
  }
end

Given(/^at det finnes en lånerkategori$/) do
  steps %Q{
    Når jeg legger til en lånerkategori som heter "Voksen"
  }
end

Given(/^at "(.*?)" eksisterer som en låner$/) do |name|
  steps %Q{
    Gitt at det finnes en lånerkategori
    Når jeg legger inn \"#{name}\" som ny låner
    Så viser systemet at \"#{name}\" er låner
  }
end

Given(/^at det finnes data som beskriver en låner$/) do
  @patron = []
  @csv = File.join(File.dirname(__FILE__), '..', 'upload-files', 'patrons.csv')
end

Given(/^at det finnes en mapping for konvertering$/) do
  @map = Migration.new(@csv)
  @context[:cardnumber] = generateRandomString
  @context[:surname] = generateRandomString
  @map.import.values[0][:cardnumber] = @context[:cardnumber]
  @map.import.values[0][:surname] = @context[:surname]
  @map.import.values[0][:categorycode] = @context[:patron_category_code]
  @map.import.values[0][:branchcode] = @context[:branchcode]
  @map.to_csv
  @map.export_csv('test.csv')
end

When(/^lånerdata migreres$/) do
  @browser.goto intranet(:patron_import)
  form = @browser.form(:action => "/cgi-bin/koha/tools/import_borrowers.pl")
  form.file_field(:id => "uploadborrowers").set File.expand_path('test.csv')
  form.select_list(:id => "matchpoint").select "Cardnumber"
  form.radio(:id => "overwrite_cardnumberyes", :value => "1").click
  form.submit

  #Would rather use net/http post, but need to look into session cookies
#  uri = URI.parse intranet(:patron_import)
#  STDOUT.puts @browser.cookies.to_a
#  headers = {
#    'Cookie' => @browser.cookies.to_a.first[:value],
#    'Content-Type' => 'application/x-www-form-urlencoded'
#  }
#  http = Net::HTTP.new(uri.host, uri.port) 
#  req = Net::HTTP::Post.new(uri.request_uri, headers)
#  query = { 'matchpoint' => 'cardnumber',
#      'overwrite_cardnumberyes' => 1, 
#      'uploadborrowers' => @csv }
#  req.set_form_data(query)
#  req['User-Agent'] = 'Mozilla'
#  res = http.request(req)
  #res = Net::HTTP.post_form(URI.parse(intranet(:patron_import)), )
#  STDOUT.puts res.inspect
#  STDOUT.puts res.body

  @cleanup.push( "lånernummer #{@context[:cardnumber]}" =>
    lambda do
      @browser.goto intranet(:patrons)
      @browser.text_field(:id => "searchmember").set @context[:cardnumber]
      @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
      #Phantomjs doesn't handle javascript popus, so we must override
      #the confirm function to simulate "OK" click:
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "More").click
      @browser.a(:id => "deletepatron").click
      #@browser.alert.ok #works in chrome & firefox, but not phantomjs
    end
  )
end

Then(/^samsvarer de migrerte lånerdata med mapping$/) do
  @browser.goto intranet(:patrons)
  @browser.text_field(:id => "searchmember").set @context[:cardnumber]
  @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
  @browser.title.should include @context[:surname]
  STDOUT.puts @browser.html
end

When(/^jeg legger til en lånerkategori som heter "(.*?)"$/) do |name|
  @browser.goto intranet(:patron_categories)
  @browser.link(:id => "newcategory").click
  @context[:patron_category_code] = name.upcase
  @context[:patron_category_description] = name
  form = @browser.form(:name => "Aform")
  form.text_field(:id => "categorycode").set @context[:patron_category_code]
  form.text_field(:id => "description").set @context[:patron_category_description]
  form.select_list(:id => "category_type").select "Adult"
  form.text_field(:id => "enrolmentperiod").set "1"  # Months
  form.submit
  @browser.form(:name => "Aform").should_not be_present

  @cleanup.push( "lånerkategori #{name}" =>
    lambda do
      @browser.goto intranet(:patron_categories)
      table = @browser.table(:id => "table_categorie")
      table.rows.each do |row|
        if row.text.include?(name)
          row.link(:href => /op=delete_confirm/).click
          @browser.input(:value => "Delete this category").click
          break
        end
      end
    end
  )
end

When(/^jeg legger inn "(.*?)" som ny låner$/) do |name|
  @browser.goto intranet(:patrons)
  @browser.button(:text => "New patron").click
  @browser.div(:class => "btn-group").ul(:class => "dropdown-menu").a.click
  form = @browser.form(:name => "form")
  form.text_field(:id => "surname").set name
  form.text_field(:id => "userid").set name
  form.text_field(:id => "password").set name
  form.text_field(:id => "password2").set name
  form.submit

  @cleanup.push( "låner #{name}" =>
    lambda do
      @browser.goto intranet(:patrons)
      @browser.text_field(:id => "searchmember").set name
      @browser.form(:action => "/cgi-bin/koha/members/member.pl").submit
      #Phantomjs doesn't handle javascript popus, so we must override
      #the confirm function to simulate "OK" click:
      @browser.execute_script("window.confirm = function(msg){return true;}")
      @browser.button(:text => "More").click
      @browser.a(:id => "deletepatron").click
      #@browser.alert.ok #works in chrome & firefox, but not phantomjs
    end
  )
end

Then(/^kan jeg se kategorien i listen over lånerkategorier$/) do
  table = @browser.table(:id => "table_categorie")
  table.wait_until_present
  table.text.should include(@context[:patron_category_code])
end

Then(/^viser systemet at "(.*?)" er låner$/) do |name|
  @browser.goto intranet(:patrons)
  @browser.a(:text => "K").click
  # Koha will open the patron details page, as long as
  # there is just one patron with surname starting with 'K'
  @browser.title.should include name
  @context[:cardnumber] = @browser.title.match(/\((.*?)\)/)[1]
end
