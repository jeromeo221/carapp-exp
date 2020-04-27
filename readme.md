# Car Application
Backend component of the application to maintain fuel transactions of a certain vehicle in order to determine the efficiency and cost.

To install, run:
`npm install`

Configure .env and .env.test after cloning with the following properties:
* `FRONTEND_ENDPOINT` - Base URL of the front end that will be calling this service
* `AUTHORIZER_PHRASE` - Secret text used to sign the JWT token for user authentication 
* `REFRESHER_PHRASE` - Secret text used to refresh the Authorization token. Must be different than `AUTHORIZER_PHRASE`
* `MONGODB_URL` - Base URL of the MongoDB database

### API Calls

Authorization API:
* Signup
* Login - Gives an authorization token and a refresh token.
* Refresh - When the page is refreshed in the browser, this will be invoked to re-initialize the authorization token.
* Logout

#### The API calls below requires an authorization token.

Vehicle API:
* Add Vehicle
* List Vehicle
* Get Vehicle
* Delete Vehicle - Deleting a vehicle will also delete the fuel transactions linked to it.
* Update Vehicle

Fuel API:
* Add Fuel
* List Fuel
* Get Fuel
* Delete Fuel
* Update Fuel - Only some of the properties of the transaction can be updated.

User API:
* Update User
* Update User Password


### Future Plans
* For now, this is using Serverless Framework along side with express server, which is not a microservice. This can be easily updated later to be a fully functional microservice.
* Convert to TypeScript
* Allow user to delete its account
