# File map

- `index.html` — trang chủ M-Y-O Windows VPS, thông tin cấu hình và ô kết nối.
- `pc.html` — trang cấu hình/kết nối tới Windows VM đã triển khai.
- `manifest.webmanifest`, `sw.js`, `assets/pwa.js` — cài đặt PWA và cache giao diện.
- `compose.yaml` — Windows 11 KVM VM, Caddy HTTPS/Basic Auth và disk API.
- `cloud-pc/Caddyfile` — reverse proxy riêng tới Windows console.
- `cloud-pc/WINDOWS-VPS.md` — điều kiện host, triển khai, lưu trữ và giới hạn.
- `scripts/bootstrap-windows-pc.sh` — kiểm tra KVM/domain, tạo credentials và khởi chạy dịch vụ.
- `server/` — API đĩa ảo có xác thực và bộ kiểm thử.
- `downloads/software-catalog.json`, `downloads/apps/` — shortcut ứng dụng Windows thông dụng từ nguồn chính thức.
