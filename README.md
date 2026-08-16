# Cookie Recipe

Exports browser cookies to a JSON file and imports them into another Chrome (or Chromium-based) browser/profile.

# SECURITY WARNING!
## A cookie file is effectively a bundle of your login sessions for every site included. Treat it like a password file:

- Don't email it, upload it to cloud storage, or send it over chat apps as plain text.
- Delete the exported file as soon as you're done importing.
- Only ever do this between browsers/devices you personally own and control.
- #### HE JSON FILE WITH THE SESSION ISN'T ENCRYPTED SO ANYONE THAT GETS THE JSON FILE IS GETTING YOUR DATA AND YOU CAN'T GET NOTIFIED INSTANTLY! 
- If you changed a password or an username for an account or anything that can refresh the session, the old ones became useless, but reccomended to be deleted. 
- This EXtension is MIT License protected.
- #### I AM NOT RESPONSIVE TO ACCOUNT LOSS OR DATA LEAKS & COMPROMISSES! DON'T USE FOR VERY IMPORTANT ACCOUNT LIKE GOOGLE, YAHOO, ICLOUD OR CHREDIT/BANK ACCOUNT!!!

## Install (unpacked, both browsers)
#### For Chrome: 
1. Unzip this folder somewhere permanent.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the extracted folder.
5. Pin the extension icon for easy access.

Repeat on the second browser/profile you want to import into.
#### For FIrefox:
1. Go to `about:addons`.
2. Press the Settting (gear icon) On Top Left.
3. Go to `install Add-Ons From File...`
4. Choose the signed `FirefoxRelease.xpi`
##### Any modification of the xpi source code might break the signature. Unsigned FIrefox extension works only work on FireFox Dev Edition with 

#### How yo Bypass FireFox Extension signature (Firefox Dev Edition Only)
1. Go to `about:addons`
2. Search for `xpinstall.signatures.required`
3. Toogle the Value as `False`

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

- **Http Only cookies still transfer** — the `cookies` API can read/write them even though page JavaScript can't, which is why this needs to be an extension rather than a bookmarklet or console script.
- Some sites bind sessions to IP address, device fingerprint, or user-agent, so importing cookies won't always keep you logged in even if the transfer itself worked.
- Expired or session-only cookies won't be reusable after the source browser closes.
- It support both chromium based browsers (Chrome, Edge, Opera, Brave etc.) and firefox as well and sharing cookies sessions work between them BUT It doesn't guarantee a successfully Chromium - Firefox Share. 
- For Firefox had to open in another tab because firefox closes the extension automaticaly.
