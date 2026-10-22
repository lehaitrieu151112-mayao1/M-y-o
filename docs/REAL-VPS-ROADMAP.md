# Moving from the prototype to a real VPS / cloud gaming PC

## Current state
The project is a functional web UI and browser-side workspace. It does not provision a remote virtual machine, launch Windows, provide GPU execution, or stream games. CPU/GPU/RAM/SSD selectors are saved configuration targets.

## What a real remote PC needs
1. **Compute host** — a Windows-capable cloud instance; GPU passthrough or dedicated GPU for many modern games.
2. **Licensing and publisher compliance** — permitted Windows licensing and compliance with each game's anti-cheat, account, and virtualisation policies.
3. **Remote display and input** — a supported remote desktop or low-latency streaming stack with keyboard/mouse/gamepad input. Ordinary website iframe embedding is not equivalent.
4. **Storage and image lifecycle** — persistent disks, snapshots, quotas, per-user isolation, cleanup and backups.
5. **Identity and access** — authenticated users, short-lived connection credentials, access controls, secret handling and audit logs.
6. **Spend protection** — explicit budget approval, idle shutdown, quotas, time limits and usage alerts. GPU instances can incur charges even during idle time.
7. **Operational controls** — region latency, availability, monitoring, firewall rules, patching, recovery and abuse prevention.

## Safe staged plan
- **Stage A — free demo (current):** validate the interface, file interactions and official game links. No remote VM is created.
- **Stage B — sandbox proof-of-concept:** compare suitable providers and confirm availability/pricing, especially for GPU instances. Choose a provider and hard spending cap before creating any paid infrastructure.
- **Stage C — real remote session:** set up one controlled machine with explicit sign-in and automatic shutdown, then connect it through a supported remote desktop/streaming product.
- **Stage D — multi-user service:** only after testing, add per-user instances, persistence, queueing, billing, quotas and isolation.

## Non-negotiable truth
There is no way for a static web page to conjure a high-performance Windows PC or unlimited GPU/RAM/SSD for free. A remote PC requires real compute somewhere. This repository deliberately does not pretend that changing a selector allocates real hardware, and it does not create paid resources automatically.
