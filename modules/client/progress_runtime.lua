local zxlib = rawget(_G, 'zxlib') or {}

local function requestAnimDict(dict)
  if type(dict) ~= 'string' or dict == '' then
    return false
  end

  RequestAnimDict(dict)
  local timeout = GetGameTimer() + 4000

  while not HasAnimDictLoaded(dict) do
    Wait(0)
    if GetGameTimer() > timeout then
      return false
    end
  end

  return true
end

local function requestModel(model)
  local modelHash = model
  if type(model) == 'string' then
    modelHash = joaat(model)
  end

  if type(modelHash) ~= 'number' or modelHash == 0 or not IsModelValid(modelHash) then
    return nil
  end

  RequestModel(modelHash)
  local timeout = GetGameTimer() + 4000

  while not HasModelLoaded(modelHash) do
    Wait(0)
    if GetGameTimer() > timeout then
      return nil
    end
  end

  return modelHash
end

local function toVector3(input)
  if type(input) ~= 'table' then
    return 0.0, 0.0, 0.0
  end

  return tonumber(input.x) or 0.0, tonumber(input.y) or 0.0, tonumber(input.z) or 0.0
end

local function normalizeProps(input)
  if type(input) ~= 'table' then
    return {}
  end

  if input.model ~= nil then
    return { input }
  end

  local props = {}
  for index = 1, #input do
    local entry = input[index]
    if type(entry) == 'table' and entry.model ~= nil then
      props[#props + 1] = entry
    end
  end

  return props
end

local function disableControls(state)
  local disable = state.disable

  if disable.move then
    DisableControlAction(0, 30, true)
    DisableControlAction(0, 31, true)
    DisableControlAction(0, 32, true)
    DisableControlAction(0, 33, true)
    DisableControlAction(0, 34, true)
    DisableControlAction(0, 35, true)
    DisableControlAction(0, 21, true)
  end

  if disable.car then
    DisableControlAction(0, 59, true)
    DisableControlAction(0, 60, true)
    DisableControlAction(0, 61, true)
    DisableControlAction(0, 62, true)
    DisableControlAction(0, 63, true)
    DisableControlAction(0, 64, true)
    DisableControlAction(0, 71, true)
    DisableControlAction(0, 72, true)
    DisableControlAction(0, 75, true)
    DisableControlAction(0, 76, true)
  end

  if disable.combat then
    DisableControlAction(0, 24, true)
    DisableControlAction(0, 25, true)
    DisableControlAction(0, 45, true)
    DisableControlAction(0, 140, true)
    DisableControlAction(0, 141, true)
    DisableControlAction(0, 142, true)
    DisableControlAction(0, 257, true)
    DisableControlAction(0, 263, true)
    DisableControlAction(0, 264, true)
    DisablePlayerFiring(PlayerId(), true)
  end

  if disable.mouse then
    DisableControlAction(0, 1, true)
    DisableControlAction(0, 2, true)
    DisableControlAction(0, 106, true)
  end
end

function zxlib._createProgressRuntime(id, options)
  local runtime = {
    id = id,
    stopped = false,
    spawnedProps = {},
    disable = type(options.disable) == 'table' and {
      move = options.disable.move == true,
      car = options.disable.car == true,
      combat = options.disable.combat == true,
      mouse = options.disable.mouse == true
    } or {
      move = false,
      car = false,
      combat = false,
      mouse = false
    },
    animActive = false
  }

  local ped = PlayerPedId()
  local anim = type(options.anim) == 'table' and options.anim or nil
  if anim ~= nil then
    if type(anim.scenario) == 'string' and anim.scenario ~= '' then
      TaskStartScenarioInPlace(ped, anim.scenario, 0, true)
      runtime.animActive = true
    elseif requestAnimDict(anim.dict) and type(anim.clip) == 'string' and anim.clip ~= '' then
      TaskPlayAnim(
        ped,
        anim.dict,
        anim.clip,
        tonumber(anim.blendIn) or 3.0,
        tonumber(anim.blendOut) or 1.0,
        tonumber(anim.duration) or -1,
        math.tointeger(anim.flag) or 49,
        tonumber(anim.playbackRate) or 0.0,
        false,
        false,
        false
      )
      runtime.animActive = true
    end
  end

  local props = normalizeProps(options.prop)
  for index = 1, #props do
    local prop = props[index]
    local modelHash = requestModel(prop.model)
    if modelHash ~= nil then
      local entity = CreateObject(modelHash, 0.0, 0.0, 0.0, false, false, false)
      if entity ~= 0 and DoesEntityExist(entity) then
        local x, y, z = toVector3(prop.pos)
        local rx, ry, rz = toVector3(prop.rot)
        AttachEntityToEntity(
          entity,
          ped,
          GetPedBoneIndex(ped, math.tointeger(prop.bone) or 60309),
          x,
          y,
          z,
          rx,
          ry,
          rz,
          true,
          true,
          false,
          true,
          1,
          true
        )
        runtime.spawnedProps[#runtime.spawnedProps + 1] = entity
      end
      SetModelAsNoLongerNeeded(modelHash)
    end
  end

  if runtime.disable.move or runtime.disable.car or runtime.disable.combat or runtime.disable.mouse then
    CreateThread(function()
      while not runtime.stopped do
        Wait(0)
        disableControls(runtime)
      end
    end)
  end

  function runtime:stop()
    if self.stopped then
      return
    end

    self.stopped = true

    if self.animActive then
      ClearPedTasks(PlayerPedId())
    end

    for index = 1, #self.spawnedProps do
      local entity = self.spawnedProps[index]
      if entity and DoesEntityExist(entity) then
        DeleteEntity(entity)
      end
    end
  end

  return runtime
end

return zxlib