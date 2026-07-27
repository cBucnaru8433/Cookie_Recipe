# Cookie Transfer Extension

Exports browser cookies to a JSON file and imports them into another Chrome (or Chromium-based) browser/profile.

## Install (unpacked, both browsers)

1. Unzip this folder somewhere permanent.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the extracted folder.
5. Pin the extension icon for easy access.

Repeat on the second browser/profile you want to import into.

## Export

1. Open the site whose session you want to copy (e.g. log in normally on browser A).
2. Click the extension icon.
3. Click **Export cookies for this site** (just that domain) or **Export ALL cookies** (every site the browser has cookies for).
4. Save the `.json` file it downloads.

## Import

1. Move the exported `.json` file to the second browser/computer (USB drive, private file transfer, encrypted note, etc. — see warning below).
2. Open the extension on browser B.
3. Choose the file under **Import a previously exported file**.
4. Click **Import cookies**.
5. Reload the site — you should now be logged in with the same session.

## Notes and limits

- **HttpOnly cookies still transfer** — the `cookies` API can read/write them even though page JavaScript can't, which is why this needs to be an extension rather than a bookmarklet or console script.
- Some sites bind sessions to IP address, device fingerprint, or user-agent, so importing cookies won't always keep you logged in even if the transfer itself worked.
- Expired or session-only cookies won't be reusable after the source browser closes.
- It support both chromium based browsers (Chrome, Edge, Opera, Brave etc.) and firefox as well and sharing cookies sessions work between them.
- The firefox .xpi file is still not signed so you have to use firefox Dev version and bypass the restriction. 
- for Firefox had to open in another tab because firefox closes the extension automaticaly.
## Security warning

A cookie file is effectively a bundle of your login sessions for every site included. Treat it like a password file:

- Don't email it, upload it to cloud storage, or send it over chat apps as plain text.
- Use a direct transfer instead: a USB drive, `scp`, an encrypted archive, or a temporary end-to-end-encrypted note.
- Delete the exported file as soon as you're done importing.
- Only ever do this between browsers/devices you personally own and control.
- THE JSON FILE WITH THE SESSION ISN'T ENCRYPTED SO ANYONE THAT GETS THE JSON FILE IS GETTING YOUR DATA AND YOU CAN'T GET NOTIFIED INSTANTLY! 
- If you changed a password or an username for an account or anything that can refresh the session, the old ones became useless, but reccomended to be deleted. 

## Upcoming features

Here are some upcoming features:
- JSON encryption, before exporting, you will be able to encrypt the file with a password. That password is the hash of encrypting and uncrypting the files. Any password has an unique file encryption.
- More themes, instead of white/dark theme, you're able to choose a custom theme and to switch between them. 
- Signed .xpi firefox extension.
- More Coming Soon...