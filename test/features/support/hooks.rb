# encoding: utf-8
require 'pp'
require 'headless'

# TODO: Should pull report dir (if any) from cucumber command options
REPORT_DIR = 'report'
FileUtils.mkdir_p REPORT_DIR

def filenameify(string, sep = '-')
  filename = string.downcase
  filename.gsub!(/[^a-z0-9\-_]+/, sep)
  unless sep.nil? || sep.empty?
    re_sep = Regexp.escape(sep)
    filename.gsub!(/#{re_sep}{2,}/, sep)
    filename.gsub!(/^#{re_sep}|#{re_sep}$/, '')
  end
  filename
end

def add_screenshot(name)
  filename = "#{filenameify(name)}.png"
  screenshot = @browser.screenshot
  embed screenshot.base64, 'image/png', "Screenshot"
  screenshot.save "#{REPORT_DIR}/#{filename}" # Keep on disk, as well
end

# BEFORE HOOKS will run in the same order of which they are registered.

Before do
  @context = {}
  @active = {} # Hash of active context objects (Book, Patron, Branch, etc.)
  @cleanup = [] # A stack of operations to be undone in reversed order after feature
end

Before do |scenario|
  if scenario.source_tag_names.include?("@xvfb") and !ENV['BROWSER']
    # Run scenarios tagged @xvfb with firefox in a virual framebuffer
    @headless = Headless.new
    @headless.start
    @browser = @browser || (Watir::Browser.new :firefox)
  else
    @browser = @browser || (Watir::Browser.new (ENV['BROWSER'] || "phantomjs").to_sym)
  end
  @browser.window.resize_to(1200, 1024) unless ENV['BROWSER']
  @site = @site || Site.new(@browser)
end


# Set language to English during testing, use global var to avvoid running before each scenario
Before do
  $testingLanguageSwitch ||= false
  unless $testingLanguageSwitch
    step "at jeg er logget inn som adminbruker"
    SVC::Preference.new(@browser).set("pref_language", "en")
    SVC::Preference.new(@browser).set("pref_opaclanguages", "en")
    $testingLanguageSwitch = true
  end
end


Before do |scenario|
  $random_migrate ||= false
  unless $random_migrate
    if scenario.source_tag_names.include?('@random_migrate')
      $random_migrate = RandomMigrate::Migrator.new.generate_quick_test_set() #random_migrate(16, 2, 2)
    end
  end
  @context[:random_migrate_id] = $random_migrate
end


# After all test are run
at_exit do
  @browser = @browser || (Watir::Browser.new (ENV['BROWSER'] || "phantomjs").to_sym)
  Site.new(@browser).Login.visit.login(ENV['KOHA_ADMINUSER'], ENV['KOHA_ADMINPASS'])
  # Reset to Norwegian after all tests are run
  SVC::Preference.new(@browser).set("pref_language", "nb-NO")
  SVC::Preference.new(@browser).set("pref_opaclanguages", "nb-NO")
  $testingLanguageSwitch = false
  @browser.close if @browser
  @headless.destroy if @headless
end

#  AFTER HOOKS will run in the OPPOSITE order of which they are registered.

AfterStep('@check-for-errors') do |scenario|
  sleep 0.1
  if @browser.div(:id => "errors").exist?
    unless @browser.div(:id => "errors").ps.length == 0
      fail("The errors <div> contained one or more error <p>'s'")
    end
  end
end

def title_of(scenario)
  (defined? scenario.name) ? scenario.name : scenario.scenario_outline.name
end

After do |scenario|
  @browser.close if @browser
end

After do |scenario| # cleanup based on @cleanup - in reverse order
  STDOUT.puts "--------------- Context: #{title_of(scenario)} "
  STDOUT.puts @context.pretty_inspect

  last_cleanup_exception = nil

  if @browser && @browser.driver.manage.logs.get("browser").length > 0
    STDOUT.puts "--------------- Messages to browser console:"
    STDOUT.puts @browser.driver.manage.logs.get("browser").select { |l| !l.to_s.start_with?("INFO") }
  end

  STDOUT.puts "--------------- Cleanup: #{title_of(scenario)} "
  if @browser
    step "at jeg er logget inn som adminbruker" if @cleanup.length > 0 # TODO Only relevant for Koha-related cleanups
  end
  @cleanup.reverse.each do |hash|
    cleanup_desc = " cleanup '#{hash.keys.first}'"
    cleanup_func = hash.values.first
    begin
      cleanup_func.call
      STDOUT.puts "#{cleanup_desc} completed"
    rescue Exception => e
      last_cleanup_exception = e
      STDOUT.puts "#{cleanup_desc} failed: #{e}"
      e.backtrace.each_with_index { |line, i| STDOUT.puts("  #{line}") if i < 3 }
      STDOUT.puts "--------------- Active context upon failure: #{cleanup_desc} "
      STDOUT.puts "#{@active.pretty_inspect}"
      add_screenshot("#{cleanup_desc}")
    end
  end

  STDOUT.puts("Scenario failed: #{scenario.exception}") if scenario.failed?
  STDOUT.puts("Cleanup failed: #{last_cleanup_exception}") if last_cleanup_exception
  STDOUT.puts "======================================================================================== "
  STDOUT.flush
  raise Exception.new("Cleanup failed: #{last_cleanup_exception}") if !scenario.failed? && last_cleanup_exception
end

After do |scenario|
  if scenario.failed? && @browser
    add_screenshot(title_of(scenario))
    STDOUT.puts "--------------- Active context upon failure: #{title_of(scenario)} "
    STDOUT.puts "#{@active.pretty_inspect}"
  end
end

# `FAIL_FAST=1 cucumber` to stop on first failure
After do |scenario|
  Cucumber.wants_to_quit = ENV['FAIL_FAST'] && scenario.failed?
end