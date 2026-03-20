local zxlib = rawget(_G, 'zxlib')

local DEFAULT_TITLES = {
  success = 'Success',
  error = 'Error',
  warning = 'Warning',
  info = 'Info'
}

local VALID_TYPES = {
  success = true,
  error = true,
  warning = true,
  info = true
}

local function clampDuration(duration)
  local value = math.tointeger(duration) or 5000

  if value < 250 then
    return 250
  end

  if value > 30000 then
    return 30000
  end

  return value
end

local function normalize(input, inputType, inputDuration, inputTitle, inputPlaceholders)
  if type(input) == 'table' then
    local notificationType = input.type or 'info'
    if not VALID_TYPES[notificationType] then
      notificationType = 'info'
    end

    local placeholders = input.placeholders
    local title = zxlib.ParsePlaceholders(input.title or DEFAULT_TITLES[notificationType], placeholders)
    local message = zxlib.ParsePlaceholders(input.message or '', placeholders)

    return {
      type = notificationType,
      title = title,
      message = message,
      duration = clampDuration(input.duration),
      id = input.id,
      position = input.position == 'left' and 'left' or 'right'
    }
  end

  local notificationType = inputType or 'info'
  if not VALID_TYPES[notificationType] then
    notificationType = 'info'
  end

  local placeholders = inputPlaceholders
  local title = zxlib.ParsePlaceholders(inputTitle or DEFAULT_TITLES[notificationType], placeholders)
  local message = zxlib.ParsePlaceholders(tostring(input or ''), placeholders)

  return {
    type = notificationType,
    title = title,
    message = message,
    duration = clampDuration(inputDuration),
    position = (type(inputPlaceholders) == 'table' and inputPlaceholders.position == 'left') and 'left' or 'right'
  }
end

function zxlib.Notify(input, inputType, inputDuration, inputTitle, inputPlaceholders)
  local payload = normalize(input, inputType, inputDuration, inputTitle, inputPlaceholders)
  zxlib._uiSend('notify:show', payload)
  return true
end

function zxlib.ClearNotifications()
  zxlib._uiSend('notify:clear', {})
end

return zxlib