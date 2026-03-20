local zxlib = rawget(_G, 'zxlib') or {}

_G.zxlib = zxlib

local SendNUIMessage = SendNUIMessage
local SetNuiFocus = SetNuiFocus
local SetNuiFocusKeepInput = SetNuiFocusKeepInput
local GetCurrentResourceName = GetCurrentResourceName

local uiState = zxlib.UIState or {
  isReady = false,
  hasFocus = false,
  textUI = false,
  progress = false,
  contextMenu = false,
  radialMenu = false,
  alertDialog = false
}

zxlib.UIState = uiState

local function computeFocusRequirement()
  return uiState.contextMenu or uiState.radialMenu or uiState.alertDialog
end

local function refreshFocus()
  local needsFocus = computeFocusRequirement()

  if uiState.hasFocus == needsFocus then
    return
  end

  uiState.hasFocus = needsFocus
  SetNuiFocus(needsFocus, needsFocus)
  SetNuiFocusKeepInput(false)
end

local function setVisibility(component, visible)
  local normalizedVisibility = visible == true

  if uiState[component] == normalizedVisibility then
    return
  end

  uiState[component] = normalizedVisibility
  refreshFocus()
end

local function send(action, data)
  SendNUIMessage({
    action = action,
    data = data
  })
end

local function copyToClipboard(value)
  if value == nil then
    return false, 'invalid_value'
  end

  local text = value
  if type(text) ~= 'string' then
    text = tostring(text)
  end

  if text == '' then
    return false, 'invalid_value'
  end

  send('clipboard:copy', { value = text })
  return true
end

local function parsePlaceholders(input, placeholders)
  if type(input) ~= 'string' or type(placeholders) ~= 'table' then
    return input
  end

  local function resolve(key)
    local value = placeholders[key]
    if value == nil then
      return ''
    end

    return tostring(value)
  end

  local output = input
  output = output:gsub('%${([%w_%.%-]+)}', resolve)
  output = output:gsub('{([%w_%.%-]+)}', resolve)

  return output
end

local function formatDeep(value, placeholders)
  if type(placeholders) ~= 'table' then
    return value
  end

  local valueType = type(value)
  if valueType == 'string' then
    return parsePlaceholders(value, placeholders)
  end

  if valueType ~= 'table' then
    return value
  end

  local out = {}
  for key, child in pairs(value) do
    out[key] = formatDeep(child, placeholders)
  end

  return out
end

local function hideAll()
  uiState.textUI = false
  uiState.progress = false
  uiState.contextMenu = false
  uiState.radialMenu = false
  uiState.alertDialog = false
  refreshFocus()
  send('ui:hideAll', {})
end

zxlib._uiSend = send
zxlib._uiSetVisibility = setVisibility
zxlib.ParsePlaceholders = parsePlaceholders
zxlib._uiFormatDeep = formatDeep
zxlib.HideUI = hideAll
zxlib.CopyToClipboard = copyToClipboard

RegisterNUICallback('zxlib:ui:ready', function(_, cb)
  uiState.isReady = true
  cb({ ok = true })
end)

AddEventHandler('onResourceStop', function(resourceName)
  if resourceName ~= GetCurrentResourceName() then
    return
  end

  hideAll()
end)

return zxlib