local zxlib = rawget(_G, 'zxlib') or {}

local function getLicense(source)
  if type(GetPlayerIdentifierByType) == 'function' then
    local identifier = GetPlayerIdentifierByType(source, 'license')
    if type(identifier) == 'string' and identifier ~= '' then
      return identifier
    end
  end

  if type(GetPlayerIdentifiers) == 'function' then
    local identifiers = GetPlayerIdentifiers(source)
    if type(identifiers) == 'table' then
      for index = 1, #identifiers do
        local identifier = identifiers[index]
        if type(identifier) == 'string' and identifier:sub(1, 8) == 'license:' then
          return identifier
        end
      end
    end
  end

  return 'license:unavailable'
end

RegisterNetEvent('zx_lib:server:ready', function()
  print(('[zx_lib] server ready - v%s'):format(zxlib.Version or 'unknown'))
end)

RegisterNetEvent('zx_lib:server:requestLicense', function()
  local src = source
  TriggerClientEvent('zx_lib:client:license', src, getLicense(src))
end)
