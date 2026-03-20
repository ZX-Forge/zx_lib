local zxlib = rawget(_G, 'zxlib') or {}

RegisterNetEvent('zx_lib:client:ready', function()
  print(('[zx_lib] client ready - v%s'):format(zxlib.Version or 'unknown'))
end)

function GetZXLib()
  return zxlib
end

function Notify(...)
  return zxlib.Notify(...)
end

function ClearNotifications(...)
  return zxlib.ClearNotifications(...)
end

function TextUI(...)
  return zxlib.TextUI(...)
end

function HideTextUI(...)
  return zxlib.HideTextUI(...)
end

function Progress(...)
  return zxlib.Progress(...)
end

function CancelProgress(...)
  return zxlib.CancelProgress(...)
end

function ContextMenu(...)
  return zxlib.ContextMenu(...)
end

function CloseContextMenu(...)
  return zxlib.CloseContextMenu(...)
end

function RadialMenu(...)
  return zxlib.RadialMenu(...)
end

function CloseRadialMenu(...)
  return zxlib.CloseRadialMenu(...)
end

function Alert(...)
  return zxlib.Alert(...)
end

function CloseAlert(...)
  return zxlib.CloseAlert(...)
end

function HideUI()
  return zxlib.HideUI()
end

function CopyToClipboard(...)
  return zxlib.CopyToClipboard(...)
end

function GetNotifyModule()
  return {
    Notify = zxlib.Notify,
    ClearNotifications = zxlib.ClearNotifications
  }
end

function GetTextUIModule()
  return {
    TextUI = zxlib.TextUI,
    HideTextUI = zxlib.HideTextUI
  }
end

function GetProgressModule()
  return {
    Progress = zxlib.Progress,
    CancelProgress = zxlib.CancelProgress
  }
end

function GetContextMenuModule()
  return {
    ContextMenu = zxlib.ContextMenu,
    CloseContextMenu = zxlib.CloseContextMenu
  }
end

function GetRadialMenuModule()
  return {
    RadialMenu = zxlib.RadialMenu,
    CloseRadialMenu = zxlib.CloseRadialMenu
  }
end

function GetAlertModule()
  return {
    Alert = zxlib.Alert,
    CloseAlert = zxlib.CloseAlert
  }
end

function GetClipboardModule()
  return {
    CopyToClipboard = zxlib.CopyToClipboard
  }
end
