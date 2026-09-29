# Social authentication setup

The app requires a Supabase session before rendering budget data. Google and
GitHub both use the same callback state:

    https://your-app.example/?auth=callback

Add the production URL and the local development URL
http://127.0.0.1:5173/?auth=callback to the Supabase Auth redirect allow list.
Set the production origin as the Supabase Site URL.

## Google

1. Create a Web OAuth client in Google Auth Platform.
2. Add the app origin to Authorized JavaScript origins.
3. Add the Supabase callback URL shown on the Google provider page to
   Authorized redirect URIs.
4. Configure the openid, email, and profile scopes.
5. Add the Google client ID and secret to Supabase and enable the provider.

## GitHub

1. Create a GitHub OAuth App.
2. Use the deployed app origin as its Homepage URL.
3. Use the Supabase callback URL shown on the GitHub provider page as the
   Authorization callback URL.
4. Add the GitHub client ID and secret to Supabase and enable the provider.

Provider secrets belong only in Google, GitHub, and Supabase configuration.
The browser receives only the Supabase project URL and publishable key.

## Local data

Budget data remains local to the browser and is namespaced by the authenticated
Supabase user ID. Existing unscoped data is copied once to the first user who
signs in on that browser; the original copy is retained for recovery.
