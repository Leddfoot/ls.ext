# encoding: utf-8

require 'pry'
require 'pry-nav' # https://banisterfiend.wordpress.com/2012/02/14/the-pry-ecosystem/

require 'rspec'
require 'yaml'
require 'securerandom'

BROWSER_WAIT_TIMEOUT = 5 # timeout for waiting for elements to appear using Watir::Wait.until {}

# Custom classes
require_relative 'context_structs.rb'

# Custom Modules extending Cucumber World Object
# Methods are shared between all steps
require_relative 'paths.rb'
World(Paths)

#Length needs to be short enough
def generateRandomString ()
  return SecureRandom.hex(4)
end

def retry_wait
  tries = 3
  begin
    yield
  rescue Watir::Wait::TimeoutError
    STDERR.puts "TIMEOUT: retrying .... #{(tries -= 1)}"
    if (tries == 0)
      fail
    else
      retry
    end
  end
end

def wait_for
  retries ||= 1
  Watir::Wait.until(3) do
    yield
  end
rescue Watir::Wait::TimeoutError
  unless (retries -= 1) < 0
    puts 'Refreshing and retrying'
    @browser.refresh
    retry
  else
    fail
  end
end

def retry_http_request(tries=3, &block)
  begin
    yield
  rescue Errno::ETIMEDOUT, Timeout::Error, Errno::ECONNREFUSED
    STDERR.puts "HTTP Timeout: retrying ...  #{(tries -= 1)}"
    fail if (tries == 0)
    retry
  rescue RSpec::Expectations::ExpectationNotMetError => e
    STDERR.puts "Error in HTTP Request: #{e} - retrying ...  #{(tries -= 1)}"
    fail if (tries == 0)
    sleep(3)
    retry
  end
end