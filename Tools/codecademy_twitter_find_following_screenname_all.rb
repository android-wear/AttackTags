require 'rubygems'
require 'oauth'
require 'json'

#@@counter = 0

def craft_uri_with_cursor(cursor_value) 
	baseurl = "https://api.twitter.com"
	path    = "/1.1/friends/list.json"
	query   = URI.encode_www_form(
		"screen_name" => "AttackTags",
		"count" => "200",
		"cursor" => cursor_value,
	)
	address = URI("#{baseurl}#{path}?#{query}")
	return address
end


# Print only 200 users, due to Twitter cursor limiration: 200/page(cursor)
def print_users(user_list)
	user_list["users"].each do |user|
		#puts JSON.pretty_generate(user)
		print "{\"userName\": \"#{user["name"]}\", \"screenName\": \"#{user["screen_name"]}\"},"
		print "\n"
		#counter+=1
	end
	# puts "Number of outputs: #{counter}"
end

# Make request from address and return the JSON message
def get_api_response (address)
	# Credentials
	consumer_key ||= OAuth::Consumer.new(
	    "rpO4Rb0T8rJSUoMwhpxheieYu",
	    "vhZkI5YDLxfpf0Wb8rcVWoziAsZsWoOVdlaQWIS9k7dFbF2VF5")
	access_token ||= OAuth::Token.new(
	    "186445768-SjpgHMNaoqBxeK88sjnvdMDARdjjcUqXFHjp5ebT",
	    "dgShCMj99vxTPaF6ez0h4WUgRkQBApLoYpu6C46g4B7f4")

	# Define response
	request = Net::HTTP::Get.new address.request_uri

	# Set up HTTP.
	http             = Net::HTTP.new address.host, address.port
	http.use_ssl     = true
	http.verify_mode = OpenSSL::SSL::VERIFY_PEER

	# Issue the request.
	request.oauth! http, consumer_key, access_token
	http.start
	response = http.request request
	
	# Get response body and feed to user_list
	# Parse and print the Tweet if the response code was 200
	if response.code == '200' then
		user_list = JSON.parse(response.body)
		return user_list
	end
end

users = nil

first_address = craft_uri_with_cursor("-1")
# print first_address
# print "\n"
user_list = get_api_response(first_address)
print_users(user_list)
begin
	new_address = craft_uri_with_cursor(user_list["next_cursor"])
	# print new_address
	user_list = get_api_response(new_address)
	print_users(user_list)
end until user_list["next_cursor"] == 0
nil
