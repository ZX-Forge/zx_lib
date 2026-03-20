local zxlib = rawget(_G, 'zxlib')
local pendingLicense = nil

RegisterNetEvent('zx_lib:client:license', function(identifier)
  if type(identifier) == 'string' and identifier ~= '' then
    pendingLicense = identifier
    return
  end

  pendingLicense = 'license:unavailable'
end)

local function requestLicenseFromServer(timeoutMs)
  pendingLicense = false
  TriggerServerEvent('zx_lib:server:requestLicense')

  local timeoutAt = GetGameTimer() + (timeoutMs or 2000)
  while pendingLicense == false and GetGameTimer() < timeoutAt do
    Wait(0)
  end

  local value = pendingLicense
  pendingLicense = nil

  if type(value) == 'string' and value ~= '' then
    return value
  end

  return nil
end

local function getLocalLicense()
  if type(GetPlayerIdentifierByType) == 'function' then
    local ok, identifier = pcall(GetPlayerIdentifierByType, PlayerId(), 'license')
    if ok and type(identifier) == 'string' and identifier ~= '' then
      return identifier
    end

    ok, identifier = pcall(GetPlayerIdentifierByType, tostring(PlayerId()), 'license')
    if ok and type(identifier) == 'string' and identifier ~= '' then
      return identifier
    end
  end

  if type(GetNumPlayerIdentifiers) == 'function' and type(GetPlayerIdentifier) == 'function' then
    local playerSource = tostring(PlayerId())
    local count = GetNumPlayerIdentifiers(playerSource) or 0

    for index = 0, count - 1 do
      local identifier = GetPlayerIdentifier(playerSource, index)
      if type(identifier) == 'string' and identifier:sub(1, 8) == 'license:' then
        return identifier
      end
    end
  end

  if type(GetPlayerIdentifiers) == 'function' then
    local identifiers = GetPlayerIdentifiers(PlayerId())
    if type(identifiers) == 'table' then
      for index = 1, #identifiers do
        local identifier = identifiers[index]
        if type(identifier) == 'string' and identifier:sub(1, 8) == 'license:' then
          return identifier
        end
      end
    end
  end

  local serverLicense = requestLicenseFromServer(2000)
  if type(serverLicense) == 'string' and serverLicense ~= '' then
    return serverLicense
  end

  return 'license:unavailable'
end

local function getCurrentVehicle(ped)
  if IsPedInAnyVehicle(ped, false) then
    return GetVehiclePedIsIn(ped, false)
  end

  return 0
end

local function toggleEngine()
  local vehicle = getCurrentVehicle(PlayerPedId())
  if vehicle == 0 then
    zxlib.Notify('You are not in a vehicle', 'error', 2000)
    return
  end

  local running = GetIsVehicleEngineRunning(vehicle)
  SetVehicleEngineOn(vehicle, not running, false, true)
  zxlib.Notify(running and 'Engine turned off' or 'Engine turned on', 'success', 1800)
end

local function toggleDoor(doorIndex, label)
  local vehicle = getCurrentVehicle(PlayerPedId())
  if vehicle == 0 then
    zxlib.Notify('You are not in a vehicle', 'error', 2000)
    return
  end

  local isOpen = GetVehicleDoorAngleRatio(vehicle, doorIndex) > 0.1
  if isOpen then
    SetVehicleDoorShut(vehicle, doorIndex, false)
  else
    SetVehicleDoorOpen(vehicle, doorIndex, false, false)
  end

  zxlib.Notify((label or 'Door') .. (isOpen and ' closed' or ' opened'), 'info', 1800)
end

local function seatLabel(index)
  if index == -1 then return 'Driver' end
  if index == 0 then return 'Front Passenger' end
  if index == 1 then return 'Rear Left' end
  if index == 2 then return 'Rear Right' end
  return ('Seat %d'):format(index)
end

local function buildSeatItems()
  local vehicle = getCurrentVehicle(PlayerPedId())
  if vehicle == 0 then
    return {
      {
        id = 'seat_none',
        label = 'No Vehicle',
        icon = 'alert',
        closeOnSelect = false,
        onSelect = function()
          zxlib.Notify('You are not in a vehicle', 'error', 2000)
        end
      }
    }
  end

  local seatItems = {}
  local seatCount = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle)) or 0

  for seatIndex = -1, seatCount - 2 do
    if IsVehicleSeatFree(vehicle, seatIndex) then
      local targetSeat = seatIndex
      seatItems[#seatItems + 1] = {
        id = ('seat_%d'):format(seatIndex),
        label = seatLabel(seatIndex),
        icon = 'user',
        closeOnSelect = false,
        onSelect = function()
          local ped = PlayerPedId()
          local vehicleNow = getCurrentVehicle(ped)
          if vehicleNow == 0 then
            zxlib.Notify('You are not in a vehicle', 'error', 2000)
            return
          end

          TaskWarpPedIntoVehicle(ped, vehicleNow, targetSeat)
          zxlib.Notify(('Changed to %s'):format(seatLabel(targetSeat)), 'success', 1800)
        end
      }
    end
  end

  if #seatItems == 0 then
    seatItems[1] = {
      id = 'seat_unavailable',
      label = 'No Free Seats',
      icon = 'alert',
      closeOnSelect = false,
      onSelect = function()
        zxlib.Notify('No free seats available', 'warning', 2000)
      end
    }
  end

  return seatItems
end

RegisterCommand('zxtestnotify', function(_, args)
  local side = args and args[1] == 'left' and 'left' or 'right'
  local playerName = GetPlayerName(PlayerId()) or 'Player'
  local serverId = GetPlayerServerId(PlayerId())

  zxlib.Notify({
    type = 'success',
    title = 'Hello {player}',
    message = 'Your server id is {id}',
    duration = 4500,
    position = side,
    placeholders = {
      player = playerName,
      id = serverId
    }
  })
end, false)

RegisterCommand('zxtesttextui', function(_, args)
  if args and args[1] == 'hide' then
    zxlib.HideTextUI()
    return
  end

  local side = args and args[1] == 'left' and 'left' or 'right'

  zxlib.TextUI({
    text = 'Press [{key}] to interact with {target}',
    keybind = 'E',
    position = side,
    variant = 'default',
    placeholders = {
      key = 'E',
      target = 'Locker'
    }
  })
end, false)

RegisterCommand('zxtestprogress', function()
  local playerName = GetPlayerName(PlayerId()) or 'Player'

  local started = zxlib.Progress({
    duration = 5000,
    label = 'Processing data for {player}',
    placeholders = {
      player = playerName
    },
    anim = {
      dict = 'amb@world_human_clipboard@male@idle_a',
      clip = 'idle_c',
      flag = 49
    },
    prop = {
      {
        model = 'prop_notepad_01',
        bone = 18905,
        pos = { x = 0.1, y = 0.02, z = 0.05 },
        rot = { x = 10.0, y = 0.0, z = 0.0 }
      },
      {
        model = 'prop_pencil_01',
        bone = 58866,
        pos = { x = 0.12, y = 0.02, z = 0.0 },
        rot = { x = -120.0, y = 0.0, z = 0.0 }
      }
    },
    disable = {
      move = true,
      car = true,
      combat = true,
      mouse = false
    },
    cancellable = true
  }, function(completed)
    if completed then
      zxlib.Notify('Progress complete', 'success', 2500)
      return
    end

    zxlib.Notify('Cancelled', 'error', 2000)
  end)

  if not started then
    zxlib.Notify('A progress action is already running', 'error', 2500)
  end
end, false)

RegisterCommand('zxtestcontext', function(_, args)
  local side = args and args[1] == 'left' and 'left' or 'right'
  local selectedJob = 'Unemployed'
  local volume = 50
  local streamerMode = false
  local ped = PlayerPedId()
  local playerName = GetPlayerName(PlayerId()) or 'Player'
  local serverId = GetPlayerServerId(PlayerId())
  local license = getLocalLicense()
  local currentHealth = math.max(0, (GetEntityHealth(ped) or 100) - 100)
  local currentArmor = GetPedArmour(ped) or 0
  local healthPercent = math.max(0, math.min(100, currentHealth))

  zxlib.ContextMenu({
    title = "{player}'s info",
    position = side,
    placeholders = {
      player = playerName,
      hp = currentHealth,
      armor = currentArmor,
      license = license,
      sid = serverId
    },
    items = {
      { id = 'header_1', type = 'header', title = 'Actions' },
      {
        id = 'inspect',
        title = "{player}'s info",
        description = 'Information about {player}',
        icon = 'wrench',
        image = 'https://r2.fivemanage.com/fxZvh2eJuuybSoHhD5y9S/pfpforyoutube.png',
        metadata = {
          { label = 'Username', value = '{player}' },
          { label = 'License', value = '{license}' },
          { label = 'Server ID', value = '{sid}' }
        },
        onSelect = function()
          zxlib.Notify('Vehicle diagnostics started', 'info', 3000)
        end
      },
      {
        id = 'health_status',
        title = 'Health Overview',
        description = 'Live vitals for {player}',
        icon = 'heart',
        progress = healthPercent,
        color = 'bg-green-500',
        metadata = {
          { label = 'HP', value = '{hp}' },
          { label = 'Armor', value = '{armor}' }
        }
      },
      {
        id = 'job',
        type = 'select',
        title = 'Job',
        icon = 'briefcase',
        value = selectedJob,
        options = { 'Unemployed', 'Police', 'EMS', 'Mechanic' },
        onChange = function(value)
          selectedJob = tostring(value)
          zxlib.Notify(('Job set to %s'):format(selectedJob), 'success', 2500)
        end
      },
      {
        id = 'volume',
        type = 'slider',
        title = 'Voice Volume',
        icon = 'settings',
        min = 0,
        max = 100,
        step = 1,
        value = volume,
        onChange = function(value)
          volume = tonumber(value) or volume
        end
      },
      {
        id = 'fine_amount',
        type = 'number',
        title = 'Fine Amount',
        icon = 'creditcard',
        value = 500,
        min = 0,
        max = 50000,
        step = 100,
        onChange = function(value)
          local amount = tonumber(value) or 0
          if amount < 0 then amount = 0 end
          zxlib.Notify(('Fine set: $%d'):format(amount), 'info', 1600)
        end
      },
      {
        id = 'streamer',
        type = 'checkbox',
        title = 'Streamer Mode',
        icon = 'shield',
        checked = streamerMode,
        onChange = function(value)
          streamerMode = value == true
          zxlib.Notify(streamerMode and 'Streamer mode enabled' or 'Streamer mode disabled', 'info', 2000)
        end
      }
    }
  })
end, false)

RegisterCommand('zxtestradial', function()
  zxlib.RadialMenu({
    items = {
      {
        id = 'citizen',
        label = 'Citizen',
        icon = 'users',
        items = {
          {
            id = 'show_id',
            label = 'Show ID',
            icon = 'creditcard',
            onSelect = function()
              zxlib.Notify('ID shown', 'info', 1800)
            end
          },
          {
            id = 'billing',
            label = 'Billing',
            icon = 'briefcase',
            onSelect = function()
              zxlib.Notify('Billing opened', 'info', 1800)
            end
          },
          {
            id = 'search',
            label = 'Search',
            icon = 'backpack',
            onSelect = function()
              zxlib.Notify('Search started', 'info', 1800)
            end
          }
        }
      },
      {
        id = 'vehicle',
        label = 'Vehicle',
        icon = 'car',
        items = {
          {
            id = 'engine',
            label = 'Toggle Engine',
            icon = 'key',
            closeOnSelect = false,
            onSelect = toggleEngine
          },
          {
            id = 'doors',
            label = 'Doors',
            icon = 'door',
            items = {
              {
                id = 'door_fl',
                label = 'Front Left',
                icon = 'door',
                closeOnSelect = false,
                onSelect = function()
                  toggleDoor(0, 'Front-left door')
                end
              },
              {
                id = 'door_fr',
                label = 'Front Right',
                icon = 'door',
                closeOnSelect = false,
                onSelect = function()
                  toggleDoor(1, 'Front-right door')
                end
              },
              {
                id = 'door_rl',
                label = 'Rear Left',
                icon = 'door',
                closeOnSelect = false,
                onSelect = function()
                  toggleDoor(2, 'Rear-left door')
                end
              },
              {
                id = 'door_rr',
                label = 'Rear Right',
                icon = 'door',
                closeOnSelect = false,
                onSelect = function()
                  toggleDoor(3, 'Rear-right door')
                end
              }
            }
          },
          {
            id = 'seat_shuffle',
            label = 'Change Seat',
            icon = 'user',
            items = buildSeatItems()
          },
          {
            id = 'trunk',
            label = 'Trunk',
            icon = 'briefcase',
            closeOnSelect = false,
            onSelect = function()
              toggleDoor(5, 'Trunk')
            end
          }
        }
      },
      {
        id = 'general',
        label = 'General',
        icon = 'settings',
        items = {
          {
            id = 'inventory',
            label = 'Inventory',
            icon = 'backpack',
            onSelect = function()
              zxlib.Notify('Inventory opened', 'info', 1800)
            end
          },
          {
            id = 'gps',
            label = 'Set GPS',
            icon = 'mappin',
            onSelect = function()
              zxlib.Notify('GPS set', 'success', 1800)
            end
          },
          {
            id = 'repair',
            label = 'Repair Kit',
            icon = 'hammer',
            onSelect = function()
              zxlib.Notify('Repair started', 'info', 1800)
            end
          }
        }
      },
      {
        id = 'panic',
        label = 'Panic',
        icon = 'siren',
        variant = 'danger',
        onSelect = function()
          zxlib.Notify('Panic activated', 'error', 2500)
        end
      }
    }
  })
end, false)

RegisterCommand('zxtestalert', function()
  zxlib.Alert({
    title = 'Change Job',
    description = 'Are you sure you want to become {job}?',
    placeholders = {
      job = 'Police'
    },
    confirmLabel = 'Accept',
    cancelLabel = 'Decline',
    onConfirm = function()
      zxlib.Notify('Alert confirmed', 'success', 2500)
    end
  })
end, false)

RegisterCommand('zxtesthideui', function()
  zxlib.HideUI()
end, false)

TriggerEvent('chat:addSuggestion', '/zxtestnotify', 'Test notification position', {
  { name = 'position', help = 'left or right' }
})

TriggerEvent('chat:addSuggestion', '/zxtesttextui', 'Test textui position', {
  { name = 'position', help = 'left or right or hide' }
})

TriggerEvent('chat:addSuggestion', '/zxtestcontext', 'Test context side', {
  { name = 'position', help = 'left or right' }
})

return zxlib
