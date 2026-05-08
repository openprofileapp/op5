[Setup]
AppId=app.openprofile.op5
AppName=OpenProfile
AppVersion=5.0.300
AppPublisher=OpenProfile
AppPublisherURL=https://dev.openprofile.app
AppCopyright=OpenProfile
DefaultDirName={localappdata}\OpenProfile
DefaultGroupName=OpenProfile
DisableWelcomePage=no
DisableDirPage=no
DisableProgramGroupPage=no
OutputDir=release
OutputBaseFilename=OpenProfile_5.0.300-beta-build-cfeeba0_Installer_Windows
Compression=lzma
SolidCompression=yes
WizardStyle=modern
WizardImageFile=public\branding\banner.png
SetupIconFile=public/branding/icon.svg
PrivilegesRequired=admin
CloseApplications=yes
RestartApplications=no
VersionInfoProductName=OpenProfile
VersionInfoVersion=5.0.300
VersionInfoTextVersion=5.0.300-beta-build-cfeeba0
VersionInfoProductVersion=5.0.300
VersionInfoCompany=OpenProfile
VersionInfoDescription=This is an example description
VersionInfoCopyright=OpenProfile
UsePreviousAppDir=no
UsePreviousGroup=no
UsePreviousTasks=no
UsePreviousUserInfo=no

[Files]
Source: "src-tauri\target\x86_64-pc-windows-msvc\release\openprofile.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\OpenProfile"; Filename: "{app}\openprofile.exe";
Name: "{commondesktop}\OpenProfile"; Filename: "{app}\openprofile.exe"; Tasks: desktopicon;

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional icons:"; Flags: unchecked

[Run]
Filename: "{app}\openprofile.exe"; Description: "Launch OpenProfile"; Flags: nowait postinstall skipifsilent