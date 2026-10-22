# A real remote Linux desktop, streamed through LinuxServer Webtop/KasmVNC.
FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Browser profile, desktop settings and downloads live in the persistent /config volume.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      aria2 ca-certificates curl file git htop jq nano tree unzip wget zip xz-utils bzip2 \
      fonts-noto-core fonts-noto-cjk fonts-noto-color-emoji xdg-utils \
 && rm -rf /var/lib/apt/lists/*

ENV TITLE="M-Y-O Cloud PC"
