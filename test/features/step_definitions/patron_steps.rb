# encoding: UTF-8

When(/^jeg legger til en lånerkategori$/) do
  @browser.goto intranet(:patron_categories)
  @browser.link(:id => "newcategory").click
  @context[:patron_category_code] = 'VOKSEN'
  @context[:patron_category_description] = 'Voksen'
  form = @browser.form(:name => "Aform")
  form.text_field(:id => "categorycode").set @context[:patron_category_code]
  form.text_field(:id => "description").set @context[:patron_category_description]
  form.select_list(:id => "category_type").select "Adult"
  form.text_field(:id => "enrolmentperiod").set "1"  # Months
  form.submit
  @browser.form(:name => "Aform").should_not be_present
end

Given "at det finnes en lånerkategori" do
  step "jeg legger til en lånerkategori"
end

Then(/^kan jeg se kategorien i listen over lånerkategorier$/) do
  table = @browser.table(:id => "table_categorie")
  table.should be_present
  table.text.should include(@context[:patron_category_code])
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
end

Så(/^viser systemet at "(.*?)" er låner$/) do |name|
  @browser.goto intranet(:patrons)
  @browser.a(:text => "K").click
  # Koha will open the patron details page, as long as
  # there is just one patron with surname starting with 'K'
  @browser.title.should include name
end
