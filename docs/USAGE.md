# Usage guide

## 1. Browse games
Open `index.html`, search/filter the PC game catalogue and choose “Xem giới thiệu”. These cards are informational. Click **Tạo PC** to open the PC configuration page.

The catalogue contains a curated set of examples, not every game on the internet. Publisher/store URLs may change; check the store itself for current availability, PC requirements, regional availability, age restrictions and licence terms.

## 2. Create a PC profile
On `pc.html`, select the target Windows version, region preference, CPU/GPU profile, memory profile, SSD profile, resolution and graphics-quality target. Click **Tạo PC & khởi chạy**; no game name or URL is required. The profile is saved locally in your browser. Saved profiles can be reopened or removed.

These values are target-profile metadata. They do not reserve real compute or storage.

## 3. Use the desktop
- **Google Chrome**: search Google or enter a URL. Destinations open in a real browser tab; this is necessary because many sites prohibit iframe embedding.
- **Game Hub**: choose **Nguồn tải** to open the publisher/store page in a real tab.
- **Settings**: adjust the saved profile and desktop wallpaper.
- **Task Manager**: display browser-exposed details such as logical CPU count, approximate device memory (if exposed), screen size and WebGL renderer (if allowed).
- **File Explorer**: inspect demo shortcuts, recent websites, or click **Chọn thư mục thật**. On supported browsers at HTTPS/localhost, choose a directory and grant permission to list its contents. A file that you open from the chosen directory can be read in Notepad; writing requires an explicit save action.
- **Notepad**: text can be saved to browser storage, downloaded as `.txt`, or saved through a file picker.
- **⛶ Full screen**: use the desktop or Chrome-window fullscreen control. Browser security requires a direct user gesture, and Esc exits full screen.

## 4. Install the web app
In Chrome/Edge, open the site over HTTPS and use the browser's install-app option if it is offered. The service worker caches app files for offline reopening; external game pages still require internet access.

## Data and privacy
Profiles, recent links and notes use local storage in the current browser profile. Local files are accessed only after the user selects them and grants permission. Do not select a folder containing sensitive data unless you intend to grant the site access to it.
