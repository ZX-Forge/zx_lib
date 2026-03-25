fx_version 'cerulean'
game 'gta5'

lua54 'yes'
use_experimental_fxv2_oal 'yes'
node_version '22'

name 'zx_lib'
author 'Zlexif'
description 'zx_lib FiveM utility library with interfaces and modules.'
version '0.1.1'
repository 'https://github.com/zlexif/zx_lib'

ui_page 'web/dist/index.html'
-- ui_page 'http://localhost:3000'

files {
  'web/dist/index.html',
  'web/dist/assets/*'
}

shared_scripts {
  'resource/shared/init.lua'
}

client_scripts {
  'modules/client/ui_core.lua',
  'modules/client/progress_runtime.lua',
  'modules/client/coords.lua',
  'resource/client/interface/notify.lua',
  'resource/client/interface/textui.lua',
  'resource/client/interface/progress.lua',
  'resource/client/interface/contextmenu.lua',
  'resource/client/interface/radialmenu.lua',
  'resource/client/interface/alert.lua',
  'resource/client/interface/commands.lua',
  'resource/client/init.lua'
}

server_scripts {
  'resource/server/init.lua'
}

dependencies {
  '/onesync'
}

provides {
  'zx_lib'
}

exports {
  'GetZXLib',
  'Notify',
  'ClearNotifications',
  'TextUI',
  'HideTextUI',
  'Progress',
  'CancelProgress',
  'ContextMenu',
  'CloseContextMenu',
  'RadialMenu',
  'CloseRadialMenu',
  'Alert',
  'CloseAlert',
  'HideUI',
  'CopyToClipboard',
  'GetNotifyModule',
  'GetTextUIModule',
  'GetProgressModule',
  'GetContextMenuModule',
  'GetRadialMenuModule',
  'GetAlertModule',
  'GetClipboardModule'
}

