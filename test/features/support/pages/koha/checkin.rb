# encoding: utf-8

require_relative 'circulation.rb'

class Checkin < Circulation

  def visit
    @browser.goto intranet(:returns)
    self
  end

  def checkin(barcode)
    #@browser.execute_script("printx_window = function() { return };") #Disable print slip popup
    form = @browser.form(:id => "checkin-form")
    form.text_field(:id => "barcode").set barcode
    form.submit
  end

	def confirm_checkin
	  @browser.button(class: 'approve').click
	end

end