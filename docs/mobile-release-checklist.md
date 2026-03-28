# Mobile Release Checklist

## Requirement

Before slot 18, the Android app must be publicly distributed in one of these ways:

- Upload an APK to APKPure.
- Publish an Android release on Google Play.

## Current repo status

- Mobile app uses Expo and already has EAS build profiles in `mobile/eas.json`.
- Android package name is already set in `mobile/app.json` as `com.fpt.mma301.fashionshop`.
- Backend Render blueprint already exists in `render.yaml`.
- Local Android JS bundle export was verified on 2026-03-28 with:

```bash
npm exec -- expo export --platform android --output-dir dist-android-export
```

## Fastest submission path: APKPure

Use this path if the goal is to satisfy the deployment requirement quickly.

1. Deploy the backend to a public URL.
2. Set `EXPO_PUBLIC_API_BASE_URL` to that public backend URL.
3. Log in to Expo and initialize EAS:

```bash
cd mobile
npx eas login
npx eas init
```

4. Build the APK:

```bash
npm run build:android:apk
```

5. Download the generated APK from EAS and upload it to APKPure.

## Store path: Google Play

Use this path if the requirement must be fulfilled with an official store release.

1. Finish the same backend and EAS setup steps above.
2. Build the Android App Bundle:

```bash
cd mobile
npm run build:android:aab
```

3. Create or access a Google Play Console account.
4. Create the app listing and upload the generated `.aab`.
5. Complete store metadata, content rating, privacy fields, and rollout.

## Known release blockers outside the repo

- `expo.extra.eas.projectId` is not committed yet in `mobile/app.json`, so `npx eas init` still needs to be run once with a real Expo account.
- A public backend URL is required. A production app cannot use `localhost` or `10.0.2.2`.
- No custom app icon assets are currently committed under `mobile/`, so add branding assets before public distribution.
- Publishing to APKPure or Google Play requires external accounts and manual submission steps.

## Recommended order

If time is tight, do this first:

1. Deploy backend on Render.
2. Run `eas init`.
3. Build APK with `npm run build:android:apk`.
4. Upload APK to APKPure.

If there is still time after that, prepare the Google Play listing.
