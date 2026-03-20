local zxlib = rawget(_G, 'zxlib')

local progressCallbacks = {}
local activeProgressId = nil
local counter = 0

local function clampDuration(duration)
  local value = math.tointeger(duration) or 3000

  if value < 250 then
    return 250
  end

  if value > 120000 then
    return 120000
  end

  return value
end

local function finishProgress(id, completed)
  local progressData = progressCallbacks[id]
  progressCallbacks[id] = nil

  if activeProgressId == id then
    activeProgressId = nil
    zxlib._uiSetVisibility('progress', false)
  end

  if type(progressData) == 'table' and type(progressData.runtime) == 'table' and type(progressData.runtime.stop) == 'function' then
    progressData.runtime:stop()
  end

  local callback = progressData
  if type(progressData) == 'table' then
    callback = progressData.callback
  end

  if type(callback) == 'function' then
    local ok, err = pcall(callback, completed == true)
    if not ok then
      print(('[zx_lib] progress callback error: %s'):format(err))
    end
  end
end

function zxlib.Progress(options, callback)
  if type(options) ~= 'table' then
    return false, 'invalid_options'
  end

  if activeProgressId ~= nil then
    return false, 'already_active'
  end

  counter = counter + 1
  local id = ('progress:%d'):format(counter)

  local placeholders = options.placeholders
  local payload = {
    id = id,
    duration = clampDuration(options.duration),
    label = zxlib.ParsePlaceholders(options.label or 'Working...', placeholders),
    cancellable = options.cancellable == true
  }

  local runtime = nil
  if type(zxlib._createProgressRuntime) == 'function' then
    runtime = zxlib._createProgressRuntime(id, options)
  end

  activeProgressId = id
  zxlib._uiSetVisibility('progress', true)

  local onComplete = callback or options.onComplete
  progressCallbacks[id] = {
    callback = type(onComplete) == 'function' and onComplete or nil,
    runtime = runtime
  }

  zxlib._uiSend('progress:start', payload)

  if payload.cancellable then
    CreateThread(function()
      while activeProgressId == id do
        Wait(0)
        DisableControlAction(0, 73, true)
        if IsDisabledControlJustPressed(0, 73) then
          zxlib.CancelProgress(id)
          break
        end
      end
    end)
  end

  return true, id
end

function zxlib.CancelProgress(id)
  local targetId = id or activeProgressId
  if targetId == nil then
    return false, 'no_active_progress'
  end

  zxlib._uiSend('progress:cancel', { id = targetId })
  finishProgress(targetId, false)
  return true
end

RegisterNUICallback('zxlib:progress:complete', function(data, cb)
  local id = data and data.id or activeProgressId
  if id ~= nil then
    finishProgress(id, true)
  end

  cb({ ok = true })
end)

RegisterNUICallback('zxlib:progress:cancel', function(data, cb)
  local id = data and data.id or activeProgressId
  if id ~= nil then
    finishProgress(id, false)
  end

  cb({ ok = true })
end)

return zxlib