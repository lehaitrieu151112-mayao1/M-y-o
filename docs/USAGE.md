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


## 5. Applications and downloads
Open **Ứng dụng có sẵn** for official pages for Steam, Epic Games Launcher, Riot Client, Discord, VLC, 7-Zip, OBS Studio and other Windows software. The in-browser Chrome workspace is available immediately; external Windows apps must be downloaded and installed on a real Windows system.

When you click **Trang tải** or **Nguồn tải**, M-Y-O records that you requested/opened a source page in local browser storage, then opens the official source. This is not proof that the installer downloaded successfully. After a real installer has downloaded, open PC Downloads and choose **Nhập tệp đã tải từ PC thật** to record the filename, type and size; the file stays where Windows/Chrome saved it.

To view real files in Explorer, select **Chọn thư mục thật** and grant permission to the Windows Downloads folder. Press Refresh after another tab downloads something. You can save a `.url` shortcut/JSON manifest into the selected real directory. After importing a downloaded installer, choose a destination folder in File Explorer and click **Chép tệp đã chọn vào thư mục PC thật**; the app writes the actual selected file through the browser's explicit folder permission (and asks before overwriting an existing file). GitHub contains the shared catalogue and official URL shortcuts; actual installers and per-user logs are not automatically pushed to the repository. Export `myo-download-manifest.json` and upload that metadata file manually to GitHub if you want to keep it there.