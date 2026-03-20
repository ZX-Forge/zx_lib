# zx_lib

FiveM interface/utility library.

## What this resource provides

- Notifications
- TextUI
- Progress bar
- Context menu
- Radial menu
- Alert dialog
- Clipboard copy

Everything is available through one shared object (`zxlib`) and through direct exports.

## Single export (recommended)

Use one export call, then keep the object reference:

```lua
local zxlib = exports.zx_lib:GetZXLib()

zxlib.Notify('Hello from zx_lib', 'success', 2500)
zxlib.TextUI({ text = 'Press [E] to interact', keybind = 'E' })
```

## Direct interface exports

You can call interfaces directly without loading the full object:

- `Notify`
- `ClearNotifications`
- `TextUI`
- `HideTextUI`
- `Progress`
- `CancelProgress`
- `ContextMenu`
- `CloseContextMenu`
- `RadialMenu`
- `CloseRadialMenu`
- `Alert`
- `CloseAlert`
- `HideUI`
- `CopyToClipboard`

Example:

```lua
exports.zx_lib:Notify('Export call works', 'info', 2000)
exports.zx_lib:CopyToClipboard('vec3(0.0, 0.0, 0.0)')
```

## Per-module exports

If you only want one module table:

- `GetNotifyModule()`
- `GetTextUIModule()`
- `GetProgressModule()`
- `GetContextMenuModule()`
- `GetRadialMenuModule()`
- `GetAlertModule()`
- `GetClipboardModule()`

Example:

```lua
local progress = exports.zx_lib:GetProgressModule()
progress.Progress({ duration = 2500, label = 'Working...' })
```

## Clipboard export

Clipboard copy is available as:

```lua
exports.zx_lib:CopyToClipboard('some text')
```

Under the hood, this sends a `clipboard:copy` NUI action and uses browser clipboard write.

## Development (web)

```bash
cd web
pnpm install
pnpm dev
pnpm build
```
