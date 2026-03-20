local zxlib = rawget(_G, 'zxlib')

local function normalize(input, options)
  if type(input) == 'table' then
    local placeholders = input.placeholders
    return {
      text = zxlib.ParsePlaceholders(input.text or '', placeholders),
      position = input.position or 'right',
      keybind = input.keybind or 'E',
      variant = input.variant or 'default'
    }
  end

  local payload = options or {}
  local placeholders = payload.placeholders

  return {
    text = zxlib.ParsePlaceholders(tostring(input or ''), placeholders),
    position = payload.position or 'right',
    keybind = payload.keybind or 'E',
    variant = payload.variant or 'default'
  }
end

function zxlib.TextUI(input, options)
  local payload = normalize(input, options)
  zxlib._uiSetVisibility('textUI', true)
  zxlib._uiSend('textui:show', payload)
  return true
end

function zxlib.HideTextUI()
  zxlib._uiSetVisibility('textUI', false)
  zxlib._uiSend('textui:hide', {})
end

return zxlib