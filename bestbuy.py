import requests
import time

webhook_url = 'INSERT DISCORD WEBHOOK URL'  # Replace with your webhook URL
ping = "INSERT DISCORD USER PING"

# URL for the API endpoint
url = 'https://www.bestbuy.ca/ecomm-api/availability/products'

skus = [
    "18931347", #5080
    "18931348"  #5090
]
for sku in skus:
    # Define the query parameters
    params = {
        'accept': 'application/vnd.bestbuy.standardproduct.v1+json',
        'accept-language': 'en-CA',
        'locations': '985|187|956|178|937|949|200|260|237|179|932|180|943|188|927|196|163|965|195|192|931|233|223|193|617|764|795|916|1016|319|544|910|203|199|194|977|197|198|925|259|954|161|207|160|938|164|926|176|202|959|182|622|613|175|953',
        'postalCode': 'L4E4K2',
        'skus': sku
    }

    # Define the headers
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Referer': 'https://www.bestbuy.ca/en-ca/reserve-and-pickup/' + sku,
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-origin',
        'TE': 'trailers',
        'Priority': 'u=4',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
    }

    # Send the GET request
    response = requests.get(url, params=params, headers=headers, proxies={"http": None, "https": None})
    shouldPing = False
    successful = False

    # Check if the request was successful
    if response.status_code == 200:
        # Step 3: Extract relevant data from the response
        data = response.json()
        # For example, let's send a simple message including the SKU and availability status
        if 'availabilities' in data:
            product = data['availabilities'][0]  # Take the first product in the list
            pickup = product.get('pickup', 'Unknown pickup')
            statusPickup = pickup.get('status', 'ComingSoon')
            purchasablePickup = pickup.get('purchasable', 'False')
            shipping = product.get('shipping', 'Unknown shipping')
            statusShipping = shipping.get('status', 'ComingSoon')
            purchasableShipping = shipping.get('purchasable', 'False')

            if purchasablePickup != False or purchasableShipping != False:
                shouldPing = True
                successful = True
            
            # print(type(statusPickup), type(purchasablePickup), type(statusShipping), type(purchasableShipping))

            # Format the message for Discord
            discord_message = f"Pickup status: {statusPickup} | Purchasable: {purchasablePickup} | Shipping status: {statusShipping} | Purchasable: {purchasableShipping}"
        else:
            shouldPing = True
            discord_message = "The property 'availabilities' was not found in the response."
    else:
        shouldPing = True
        discord_message = f"Failed to fetch data from BestBuy API, status code: {response.status_code}"

    # Step 4: Send the message to Discord using a Webhook
    divider = "🟢-------------------------------------------🟢" if successful else "🔴-------------------------------------------🔴"
    webhook_data = {
        'content': divider + ping + '\n' + discord_message
    }
    if shouldPing:
        discord_response = requests.post(webhook_url, json=webhook_data)

        # Check if the message was sent successfully
        if discord_response.status_code == 204:
            print("!!!!!!!!!!!!!!!!!!Message sent to Discord successfully!")
        else:
            print(f"!!!!!!!!!!!!!!!!!Failed to send message to Discord, status code: {discord_response.status_code}")
        print(discord_message)
    else:
        print("No ping: " + discord_message)