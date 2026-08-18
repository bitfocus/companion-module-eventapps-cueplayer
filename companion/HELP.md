## EventApps CuePlayer

Control CuePlayer (cue playback + jingles) from Companion over its built-in
HTTP remote-control server.

### Configuration

- **CuePlayer IP** — the IP address of the machine running CuePlayer.
- **Port** — the remote-control port (default `8770`), shown in CuePlayer under
  *Settings → Vzdálené ovládání*.
- **Token** — only needed if you enabled *"Vyžadovat token"* in CuePlayer.
  Copy it from the same settings dialog. Leave blank otherwise.
- **Poll interval** — how often Companion reads state for feedbacks/countdowns.
- **Amber / Red under** — countdown colour thresholds, in seconds.

### Notes

- Cue and jingle dropdowns list the **names**; the underlying UUID is stored
  invisibly and stays stable across show reloads and restarts.
- If the connection shows an error, check the IP/port, that CuePlayer's remote
  control is enabled, and (if required) that the token matches. A Windows
  firewall rule may be needed — CuePlayer has a one-click helper for it.
