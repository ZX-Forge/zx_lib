local zxlib = rawget(_G, 'zxlib')

local activeRadial = nil
local idCounter = 0

local function nextId()
  idCounter = idCounter + 1
  return ('radial_item_%d'):format(idCounter)
end

local function sanitizeItem(raw, placeholders, callbacks)
  local item = type(raw) == 'table' and raw or {}
  local id = item.id or nextId()

  if type(item.onSelect) == 'function' then
    callbacks[id] = item.onSelect
  end

  local sanitized = {
    id = id,
    label = zxlib.ParsePlaceholders(item.label or 'Option', placeholders),
    icon = zxlib.ParsePlaceholders(item.icon, placeholders),
    variant = item.variant,
    closeOnSelect = item.closeOnSelect ~= false
  }

  if type(item.items) == 'table' and #item.items > 0 then
    local children = {}
    for index = 1, #item.items do
      children[#children + 1] = sanitizeItem(item.items[index], placeholders, callbacks)
    end
    sanitized.items = children
  end

  return sanitized
end

function zxlib.RadialMenu(options)
  if type(options) ~= 'table' then
    return false, 'invalid_options'
  end

  local sourceItems = options.items
  if type(sourceItems) ~= 'table' then
    sourceItems = {}
  end

  local placeholders = options.placeholders
  local callbacks = {}
  local items = {}

  for index = 1, #sourceItems do
    items[#items + 1] = sanitizeItem(sourceItems[index], placeholders, callbacks)
  end

  activeRadial = {
    onSelect = callbacks,
    onClose = options.onClose
  }

  zxlib._uiSetVisibility('radialMenu', true)
  zxlib._uiSend('radial:open', {
    items = items
  })

  return true
end

function zxlib.CloseRadialMenu()
  if activeRadial and type(activeRadial.onClose) == 'function' then
    local ok, err = pcall(activeRadial.onClose)
    if not ok then
      print(('[zx_lib] radial close callback error: %s'):format(err))
    end
  end

  activeRadial = nil
  zxlib._uiSetVisibility('radialMenu', false)
  zxlib._uiSend('radial:close', {})
end

RegisterNUICallback('zxlib:radial:select', function(data, cb)
  local id = data and data.id
  local callback = activeRadial and id and activeRadial.onSelect[id]

  if type(callback) == 'function' then
    local ok, err = pcall(callback, data)
    if not ok then
      print(('[zx_lib] radial select callback error: %s'):format(err))
    end
  end

  cb({ ok = true })
end)

RegisterNUICallback('zxlib:radial:close', function(_, cb)
  if activeRadial and type(activeRadial.onClose) == 'function' then
    local ok, err = pcall(activeRadial.onClose)
    if not ok then
      print(('[zx_lib] radial close callback error: %s'):format(err))
    end
  end

  activeRadial = nil
  zxlib._uiSetVisibility('radialMenu', false)
  cb({ ok = true })
end)

return zxlib