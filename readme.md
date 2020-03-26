# Car Application
Backend component of the application to maintain fuel transactions of a certain vehicle in order to determine the efficiency and cost.

To install, run:
`npm install`

### API Calls

Authorization API:
* Signup
* Login - Gives an authorization token and a refresh token.
* Refresh - When the page is refreshed in the browser, this will be invoked to re-initialize the authorization token.
* Logout

#### The API calls below requires an authorizatio token.

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
