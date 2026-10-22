# M-Y-O Windows VPS

M-Y-O triển khai một máy ảo Windows 11 thật trên Linux VPS hỗ trợ KVM/QEMU, có đĩa ảo bền vững và cổng kết nối HTTPS được bảo vệ bằng Basic Auth. Website là trang kết nối/hướng dẫn; GitHub và Vercel không cung cấp CPU, RAM hay máy chủ.

## Cấu hình mặc định của Windows VM

- 6 vCPU
- 16 GB RAM
- Đĩa ảo 256 GB
- Windows 11, truy cập qua trình duyệt sau cổng HTTPS

Đây là mức tài nguyên cấp cho VM, không phải cấu hình mà repo tự mua hoặc tự tạo. Nên thuê host Linux x86_64 có ít nhất 32 GB RAM, 8 vCPU trở lên và SSD đủ lớn để chừa tài nguyên cho hệ điều hành host. Có thể đổi `MYO_VM_RAM`, `MYO_VM_CPU_CORES`, và `MYO_VM_DISK_SIZE` trong file `.env` trước khi khởi động.

## Điều kiện bắt buộc

- Linux x86_64 có `/dev/kvm` và `/dev/net/tun`; nhà cung cấp phải cho phép ảo hóa.
- Docker Engine và Docker Compose v2.
- IP công khai, domain DNS trỏ về host, TCP 80/443 được phép qua firewall.
- Windows activation/licensing hợp lệ thuộc trách nhiệm của chủ host.

## Triển khai

Từ máy Linux VPS mà bạn đã thuê, clone repo rồi chạy:

```bash
git clone https://github.com/lehaitrieu151112-mayao1/M-y-o.git
cd M-y-o
chmod +x scripts/bootstrap-windows-pc.sh
./scripts/bootstrap-windows-pc.sh pc.example.com
```

Thay `pc.example.com` bằng domain thật. Script kiểm tra Docker/KVM/TUN, tạo mật khẩu ngẫu nhiên trong file `.env` có quyền `600`, xác thực cấu hình Compose và khởi chạy dịch vụ. Lưu riêng thông tin gateway và Windows được in ra terminal. Lần khởi động Windows đầu tiên có thể mất 10–40 phút hoặc lâu hơn.

Sau khi DNS và HTTPS hoạt động, truy cập website và nhập domain VPS, hoặc mở trực tiếp `https://pc.example.com`. Cổng console 8006 chỉ ở mạng Docker riêng; không mở trực tiếp ra Internet.

## Dữ liệu và an toàn

- Đĩa Windows lưu trong Docker volume `myo_windows_storage`.
- Không mount thư mục Home/Downloads của host hay filesystem từ máy Windows cục bộ của người dùng vào guest.
- `docker compose down` giữ nguyên named volumes. **Không chạy `docker compose down -v`** trừ khi bạn chủ ý xóa toàn bộ dữ liệu VM.
- Không commit file `.env` hay chia sẻ mật khẩu.
- Sao lưu volume Windows trước thay đổi lớn.

Đây là một Windows VM cá nhân, không phải nền tảng VPS nhiều người dùng. GPU passthrough chưa được cấu hình; hiệu năng đồ họa phụ thuộc phần cứng và cấu hình host.

## Kiểm tra

```bash
node scripts/smoke-test.mjs
npm --prefix server run check
docker compose config --quiet
```
