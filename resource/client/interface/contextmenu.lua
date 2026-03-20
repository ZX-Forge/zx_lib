local zxlib = rawget(_G, 'zxlib')

local activeContext = nil
local idCounter = 0

local function nextId()
  idCounter = idCounter + 1
  return ('context_item_%d'):format(idCounter)
end

local function sanitizeMetadata(metadata, placeholders)
  if type(metadata) ~= 'table' then
    return nil
  end

  local result = {}
  for index = 1, #metadata do
    local item = metadata[index]
    if type(item) == 'table' then
      result[#result + 1] = {
        label = zxlib.ParsePlaceholders(item.label or '', placeholders),
        value = zxlib.ParsePlaceholders(item.value, placeholders)
      }
    end
  end

  return result
end

local function sanitizeItem(raw, placeholders, onSelectCallbacks, onChangeCallbacks)
  local item = type(raw) == 'table' and raw or {}
  local id = item.id or nextId()

  if type(item.onSelect) == 'function' then
    onSelectCallbacks[id] = item.onSelect
  end

  if type(item.onChange) == 'function' then
    onChangeCallbacks[id] = item.onChange
  end

  return {
    id = id,
    title = zxlib.ParsePlaceholders(item.title, placeholders),
    description = zxlib.ParsePlaceholders(item.description, placeholders),
    type = item.type,
    icon = zxlib.ParsePlaceholders(item.icon, placeholders),
    value = zxlib._uiFormatDeep(item.value, placeholders),
    placeholder = zxlib.ParsePlaceholders(item.placeholder, placeholders),
    min = item.min,
    max = item.max,
    step = item.step,
    checked = item.checked == true,
    readOnly = item.readOnly == true,
    options = zxlib._uiFormatDeep(item.options, placeholders),
    image = zxlib.ParsePlaceholders(item.image, placeholders),
    metadata = sanitizeMetadata(item.metadata, placeholders),
    progress = item.progress,
    color = item.color
  }
end

function zxlib.ContextMenu(options)
  if type(options) ~= 'table' then
    return false, 'invalid_options'
  end

  local placeholders = options.placeholders
  local sourceItems = options.items
  if type(sourceItems) ~= 'table' then
    sourceItems = {}
  end

  local onSelectCallbacks = {}
  local onChangeCallbacks = {}
  local items = {}

  for index = 1, #sourceItems do
    items[#items + 1] = sanitizeItem(sourceItems[index], placeholders, onSelectCallbacks, onChangeCallbacks)
  end

  activeContext = {
    onSelect = onSelectCallbacks,
    onChange = onChangeCallbacks,
    onClose = options.onClose
  }

  zxlib._uiSetVisibility('contextMenu', true)
  zxlib._uiSend('context:open', {
    title = zxlib.ParsePlaceholders(options.title or 'Context Menu', placeholders),
    position = (options.position == 'left' and 'left' or 'right'),
    items = items
  })

  return true
end

function zxlib.CloseContextMenu()
  if activeContext and type(activeContext.onClose) == 'function' then
    local ok, err = pcall(activeContext.onClose)
    if not ok then
      print(('[zx_lib] context close callback error: %s'):format(err))
    end
  end

  activeContext = nil
  zxlib._uiSetVisibility('contextMenu', false)
  zxlib._uiSend('context:close', {})
end

RegisterNUICallback('zxlib:context:select', function(data, cb)
  local id = data and data.id
  local callback = activeContext and id and activeContext.onSelect[id]

  if type(callback) == 'function' then
    local ok, err = pcall(callback, data)
    if not ok then
      print(('[zx_lib] context select callback error: %s'):format(err))
    end
  end

  cb({ ok = true })
end)

RegisterNUICallback('zxlib:context:change', function(data, cb)
  local id = data and data.id
  local callback = activeContext and id and activeContext.onChange[id]

  if type(callback) == 'function' then
    local ok, err = pcall(callback, data and data.value, data)
    if not ok then
      print(('[zx_lib] context change callback error: %s'):format(err))
    end
  end

  cb({ ok = true })
end)

RegisterNUICallback('zxlib:context:close', function(_, cb)
  if activeContext and type(activeContext.onClose) == 'function' then
    local ok, err = pcall(activeContext.onClose)
    if not ok then
      print(('[zx_lib] context close callback error: %s'):format(err))
    end
  end

  activeContext = nil
  zxlib._uiSetVisibility('contextMenu', false)
  cb({ ok = true })
end)

return zxlib