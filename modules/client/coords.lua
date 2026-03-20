local zxlib = rawget(_G, 'zxlib')

local function formatFloat(value)
  return ('%.4f'):format(value)
end

local function notifyCopied(label, value)
  local copied = false
  if type(zxlib.CopyToClipboard) == 'function' then
    copied = zxlib.CopyToClipboard(value) == true
  end

  if copied then
    zxlib.Notify(('%s copied to clipboard'):format(label), 'success', 2200)
  else
    zxlib.Notify(('%s: %s'):format(label, value), 'info', 3200)
  end
end

RegisterCommand('zxvec2', function()
  local coords = GetEntityCoords(PlayerPedId())
  local formatted = ('vec2(%s, %s)'):format(formatFloat(coords.x), formatFloat(coords.y))
  notifyCopied('vec2', formatted)
end, false)

RegisterCommand('zxvec3', function()
  local coords = GetEntityCoords(PlayerPedId())
  local formatted = ('vec3(%s, %s, %s)'):format(formatFloat(coords.x), formatFloat(coords.y), formatFloat(coords.z))
  notifyCopied('vec3', formatted)
end, false)

RegisterCommand('zxvec4', function()
  local ped = PlayerPedId()
  local coords = GetEntityCoords(ped)
  local heading = GetEntityHeading(ped)
  local formatted = ('vec4(%s, %s, %s, %s)'):format(formatFloat(coords.x), formatFloat(coords.y), formatFloat(coords.z), formatFloat(heading))
  notifyCopied('vec4', formatted)
end, false)

RegisterCommand('zxheading', function()
  local heading = GetEntityHeading(PlayerPedId())
  local formatted = formatFloat(heading)
  notifyCopied('heading', formatted)
end, false)

TriggerEvent('chat:addSuggestion', '/zxvec2', 'Copy current position as vec2')
TriggerEvent('chat:addSuggestion', '/zxvec3', 'Copy current position as vec3')
TriggerEvent('chat:addSuggestion', '/zxvec4', 'Copy current position + heading as vec4')
TriggerEvent('chat:addSuggestion', '/zxheading', 'Copy current heading')

return zxlib
