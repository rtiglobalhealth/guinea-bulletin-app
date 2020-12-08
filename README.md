# Overview

The National Malaria Control Program (NMCP) in Guinea emails a monthly bulletin that provides an update on malaria statistics for the country. This bulletin is sent to around 400 recipients and includes Ministry of Health (MoH), NMCP, donors and other stake holders. The report includes performance indicators such as the reporting rates of the health facilities and epidemiological indicators such as number of cases tested for malaria and the number of confirmed cases of malaria.  NMCP obtains tables and maps to add to the bulletin using an R script provided by CDC which pull data from the health facility monthly malaria report Excel files. 

Although this method of generating the monthly bulletin has been effectively used during the last several years, it is affected by high fragility. The R scripts are used by only one operator on one computer. The changes in the R software and its packages require periodic updates to the R script. However, operators in Guinea are not proficient in the R language and do not make the updates to the script themselves. Additionally, in order to consolidate and streamline data systems used within the Guinean Ministry of Health, the Secretary General has issued a directive to use DHIS2 platform as the one primary system to record malaria indicators. This will eliminate all parallel data systems. Thus, to comply with this directive, the NMCP will need to migrate from an Excel-based system to a DHIS2-based system. While this transition is already underway, NMCP requires technical assistance to create a new process to make the monthly bulletin using DHIS 2 platform. 

The aim of this activity is to provide the technical support to create a solution able to produce tables and maps for the monthly malaria bulletins using only the MoH DHIS2. The project will be performed in collaboration with Guinea’s MoH, CDC, and StopPalu+. 



## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner and runs all available tests found in `/src`.<br />

See the section about [running tests](https://platform.dhis2.nu/#/scripts/test) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
A deployable `.zip` file can be found in `build/bundle`!

See the section about [building](https://platform.dhis2.nu/#/scripts/build) for more information.

### `yarn deploy`

Deploys the built app in the `build` folder to a running DHIS2 instance.<br />
This command will prompt you to enter a server URL as well as the username and password of a DHIS2 user with the App Management authority.<br/>
You must run `yarn build` before running `yarn deploy`.<br />

See the section about [deploying](https://platform.dhis2.nu/#/scripts/deploy) for more information.


## Adding translations
To add a translation use the d2 cli, like this:  `d2 app scripts i18n extract`

1. Add translation using the i18n tag ( {i18n.t('Generate Template')} )
2. Run the yarn localize to generate the pot file updates
3. Provide  translations of that key in the other pot files

## Learn More

You can learn more about the platform in the [DHIS2 Application Platform Documentation](https://platform.dhis2.nu/).

You can learn more about the runtime in the [DHIS2 Application Runtime Documentation](https://runtime.dhis2.nu/).

To learn React, check out the [React documentation](https://reactjs.org/).
