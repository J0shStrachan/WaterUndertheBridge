# Water Under the Bridge

## Deploy to Netlify
Extract the ZIP. Put the contents of the water-under-the-bridge folder into a Git repository (netlify.toml at repository root). In Netlify, select Add new project > Import an existing project and connect the repository. No build command or API keys are required for the included adapters. Alternatively use `npx netlify-cli login` and `npx netlify-cli deploy --build --prod` from the extracted project. Static drag-and-drop alone will not deploy the required functions.

## Included
Responsive schematic map, opt-in fictional disruption demo, route planner and shareable itinerary, selected German gauge observations and 30-day history adapter, weather and discharge forecast adapters, GDELT headline discovery, source directory and indicative lake/lock locations.

## Limitations and verification
Default navigation status is Unknown. Navigation notices, live lock status, non-German gauges, reservoir readings, long-term historical climatology and 30–90 day rainfall/temperature outlooks are not integrated. No gauge height or modelled discharge is treated as proof of navigability. The seasonal discharge model endpoint needs verification. The exact 10% geographic buffer and infrastructure positions need GIS validation. Route dates are informational, not a date-specific assessment. No scheduled ingestion, database, alerts or multi-year archive. News discovery is best effort; dates are GDELT seen times, not necessarily publication dates. Open-Meteo free service is subject to non-commercial terms and quotas. Verify source licensing and Netlify quotas before public launch.

External endpoints could not be reached from the build environment. JavaScript syntax was checked; browser and deployed API behavior are not fully verified. After deployment check /.netlify/functions/gauges and /.netlify/functions/weather?lat=50.09&lon=7.76&days=7 and /.netlify/functions/news. Failures are displayed explicitly. Local development: npx netlify-cli dev.
