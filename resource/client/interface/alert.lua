local zxlib = rawget(_G, 'zxlib')

local activeAlert = nil

function zxlib.Alert(options)
  if type(options) ~= 'table' then
    return false, 'invalid_options'
  end

  local placeholders = options.placeholders

  activeAlert = {
    onConfirm = options.onConfirm,
    onCancel = options.onCancel
  }

  zxlib._uiSetVisibility('alertDialog', true)
  zxlib._uiSend('alert:open', {
    title = zxlib.ParsePlaceholders(options.title or 'Confirm', placeholders),
    description = zxlib.ParsePlaceholders(options.description or '', placeholders),
    confirmLabel = zxlib.ParsePlaceholders(options.confirmLabel or 'Confirm', placeholders),
    cancelLabel = zxlib.ParsePlaceholders(options.cancelLabel or 'Cancel', placeholders)
  })

  return true
end

function zxlib.CloseAlert()
  activeAlert = nil
  zxlib._uiSetVisibility('alertDialog', false)
  zxlib._uiSend('alert:close', {})
end

RegisterNUICallback('zxlib:alert:confirm', function(data, cb)
  local callback = activeAlert and activeAlert.onConfirm
  activeAlert = nil
  zxlib._uiSetVisibility('alertDialog', false)

  if type(callback) == 'function' then
    local ok, err = pcall(callback, data)
    if not ok then
      print(('[zx_lib] alert confirm callback error: %s'):format(err))
    end
  end

  cb({ ok = true })
end)

RegisterNUICallback('zxlib:alert:cancel', function(data, cb)
  local callback = activeAlert and activeAlert.onCancel
  activeAlert = nil
  zxlib._uiSetVisibility('alertDialog', false)

  if type(callback) == 'function' then
    local ok, err = pcall(callback, data)
    if not ok then
      print(('[zx_lib] alert cancel callback error: %s'):format(err))
    end
  end

  cb({ ok = true })
end)

RegisterNUICallback('zxlib:alert:close', function(_, cb)
  local callback = activeAlert and activeAlert.onCancel
  activeAlert = nil
  zxlib._uiSetVisibility('alertDialog', false)

  if type(callback) == 'function' then
    local ok, err = pcall(callback)
    if not ok then
      print(('[zx_lib] alert close callback error: %s'):format(err))
    end
  end

  cb({ ok = true })
end)

return zxlib