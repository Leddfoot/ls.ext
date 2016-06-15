# encoding: UTF-8
require_relative '../support/context_structs.rb'
Given(/^at det finnes en materialtype$/) do
  step "jeg legger til en materialtype"
end

Given(/^at boka finnes i biblioteket$/) do
  steps %Q{
    Gitt at det finnes en avdeling
    Når jeg legger til en materialtype
    Og jeg legger inn boka som en ny bok
  }
end

Given(/^at boka er tilgjengelig$/) do
  step "viser systemet at boka er en bok som kan lånes ut"
end

Given(/^at boka er tilgjengelig \(Opac\)$/) do
  @browser.table(:id => "DataTables_Table_0").tbody.tr.cells[4].text.should eq("Available")
end

When(/^jeg legger inn boka som en ny bok$/) do
  step "at det finnes en avdeling"       unless @active[:branch]
  step "jeg legger til en materialtype"  unless @active[:itemtype]
  book = SVC::Biblio.new(@browser,@context,@active).add

  @active[:book] = book
  @active[:item] = book.items.first
  (@context[:books] ||= []) << book
  @cleanup.push( "bok #{book.biblionumber}" =>
    lambda do
      SVC::Biblio.new(@browser).delete(book.biblionumber)
    end
  )
end

When(/^jeg legger til et nytt eksemplar$/) do
  book = @active[:book]
  book.addItem
  book.items[1].branch   = book.items[0].branch
  book.items[1].itemtype = book.items[0].itemtype
  book.items[1].barcode  = '0301%010d' % rand(10 ** 10)

  @site.AddItem.
      visit(book.biblionumber).
      add(book.items[1].barcode, book.items[1].branch.code, book.items[1].itemtype.code)

  @active[:item] = book.items[1]
end

When(/^jeg legger til en materialtype$/) do
  itemtype = ItemType.new

  @site.ItemTypes.visit.create(itemtype.code, itemtype.desc)

  @active[:itemtype] = itemtype
  (@context[:itemtypes] ||= []) << itemtype

  @cleanup.push( "materialtype #{itemtype.code}" =>
    lambda do
      @site.ItemTypes.visit.show_all.delete(itemtype.code)
    end
  )
end

Then(/^kan jeg se materialtypen i listen over materialtyper$/) do
  @site.ItemTypes.visit.show_all.exists(@active[:itemtype].code, @active[:itemtype].desc)
end

Then(/^viser systemet at boka er en bok som( ikke)? kan lånes ut$/) do |boolean|
  book = @active[:book]

  biblio_page = @site.BiblioDetail.visit(book.biblionumber)
  biblio_page.header.should include(book.title)

  item_status = biblio_page.item_status(book.items.first.barcode)
  if boolean
    item_status.should_not include("vailable")
  else
    item_status.should include("vailable")
  end
end

Then(/^kan jeg søke opp boka$/) do
  biblio_page = @site.Home.search_catalog(@active[:book].title)
  biblio_page.header.should include(@active[:book].title)
  biblio_page.status.should include("Tilgjengelig")
end

Given(/^at det finnes et verk med en publikasjon og et eksemplar$/) do
  id = SecureRandom.hex(8)
  services = "http://#{ENV['HOST']}:#{port(:services)}"
  migrator = RandomMigrate::Migrator.new(services)

  work = RandomMigrate::Entity.new('work', services)
  @context[:work_uri] = migrator.post_ntriples('work', work.to_ntriples)

  publication = RandomMigrate::Entity.new('publication', services)
  @context[:publication_maintitle] = "book #{id}"
  publication.add_literal('mainTitle', @context[:publication_maintitle])
  publication.add_authorized('publicationOf', @context[:work_uri])
  publication.add_item(true, 'placement1', @active[:branch].code)
  @context[:publication_uri] = migrator.post_ntriples('publication', publication.to_ntriples)

  record_data = migrator.get_record_data(@context[:work_uri], @context[:publication_uri])
  @context[:publication_recordid] = record_data[:publication_recordid]
  @context[:item_barcode] = record_data[:item_barcode]
  @cleanup.push("biblio #{@context[:publication_recordid]} med eksemplarer" =>
                    lambda do
                      SVC::Biblio.new(@browser).delete(@context[:publication_recordid])
                    end
  )
end