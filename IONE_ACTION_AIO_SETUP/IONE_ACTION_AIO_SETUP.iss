;Ôª? SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!
#define MyDateTimeString GetDateTimeString('yyyymmdd', '', '');
[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{A717F79A-3E09-4441-B378-86CE25CD64C3}}
AppName={cm:MyAppName}
AppVerName={cm:MyAppVerName}
AppPublisher=IONE_ACTION_AIO
AppPublisherURL=
AppSupportURL=
AppUpdatesURL=
DefaultDirName={pf}\{cm:GroupName}\
DefaultGroupName=IONE_ACTION_AIO
OutputBaseFilename=IONE_ACTION_AIO_SETUP_{#MyDateTimeString}
Compression=lzma
SolidCompression=true
AppendDefaultGroupName=false
SetupIconFile=Files\Icon.ico
UninstallDisplayIcon={app}\Icon.ico
LicenseFile=Files\license.txt
UninstallFilesDir={win}
WizardImageStretch=false
DirExistsWarning=no
ShowLanguageDialog=yes 
OutputDir=setup
AlwaysRestart=false
                                                     
[Languages]
Name: en; MessagesFile: compiler:\Default.isl
[Messages]
en.BeveledLabel=English 

[CustomMessages]               
en.MyAppVerName=IONE_ACTION_AIO
en.MyAppName=IONE_ACTION_AIO
en.GroupName=IONE_ACTION_AIO
en.RunConfig=IONE_ACTION_AIO
en.Help=Help  
en.warning=Warning!
en.exist1=An old version of AP is detected. Please uninstall it.
en.Device=Do NOT Find Gaming Keyboard!
 
  
[Files]
; NOTE: Don't use "Flags: ignoreversion" on any shared system files   
Source: Files\*; DestDir: {app};Flags: recursesubdirs  ignoreversion;  
Source: "AppDataFiles\*"; DestDir: {userappdata}\IONE_ACTION_AIO\; Flags: recursesubdirs ignoreversion createallsubdirs;   
Source: "otherExe\iOne A08s DTS Driver Setup v1.2.1.exe"; DestDir:{app}; Flags: recursesubdirs  ignoreversion; AfterInstall: RunOtherInstaller
 
;Source: FWUpdate\*; DestDir: {app}\FWUpdate; Flags: recursesubdirs ignoreversion createallsubdirs   

[Registry]                                                                                                                                                              
Root: HKLM; Subkey: SOFTWARE\Microsoft\Windows\CurrentVersion\Run; ValueType: string; ValueName:IONE_ACTION_AIO; ValueData: {app}\IONE_ACTION_AIO.exe --hide; Flags: uninsdeletevalue
;Root: HKLM; Subkey: SOFTWARE\Microsoft\Windows\CurrentVersion\Run; ValueType: string; ValueName:Tesoro G11TKL; ValueData: {app}\G11TKL\App_G11TKL.exe; Flags: uninsdeletevalue

[Icons]
Name: {group}\{cm:UninstallProgram, }; Filename: {uninstallexe}  
Name: {commondesktop}\{cm:RunConfig}; Filename: {app}\IONE_ACTION_AIO.exe

[Run]           
;Filename: {app}\G12ULP\App_G12ULP.exe; Flags: nowait skipifsilent runasoriginaluser hidewizard;
;Filename: {app}\G11TKL\App_G11TKL.exe; Flags: nowait skipifsilent runasoriginaluser hidewizard; 
;Filename: {app}\Tesoro 360.exe; Flags: nowait skipifsilent runasoriginaluser hidewizard;
                                                               
Filename: {app}\IONE_ACTION_AIO.exe; Parameters:--forcehide; Flags: nowait skipifsilent runasoriginaluser hidewizard;   
Filename: {app}\IONE_ACTION_AIO.exe; Description: {cm:RunConfig}; Flags: nowait postinstall skipifsilent

[Code]        

var
HasRun:HWND;
ResultCode: Integer;
LastUninstallString: String;

procedure RunOtherInstaller;
var
  ResultCode: Integer;
begin
  if not Exec(ExpandConstant('{app}\iOne A08s DTS Driver Setup v1.2.1.exe'), '', '', SW_SHOWNORMAL,        
    ewWaitUntilTerminated, ResultCode)
  then
    MsgBox('Other installer failed to run!' + #13#10 +
      SysErrorMessage(ResultCode), mbError, MB_OK);
end;
   
procedure TaskKill(FileName: String);
var
  ResultCode: Integer;
begin
    Exec(ExpandConstant('taskkill.exe'), '/t /f /im ' + '"' + FileName + '"', '', SW_HIDE,ewWaitUntilTerminated, ResultCode);
end;

function CloseApp() : Boolean;
begin
  TaskKill('IONE_ACTION_AIO.exe');
  Result := true;
end;

function InitializeSetup(): Boolean;
begin 
  Result := true;
  CloseApp();

// if RegQueryStringValue(HKEY_LOCAL_MACHINE, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{A717F79A-3E09-4441-B378-86CE25CD64C3}}_is1','UninstallString', LastUninstallString) then
//    begin
//      StringChangeEx(LastUninstallString, '"', '', True);
//      //Exec(LastUninstallString,'', '', SW_SHOW,ewNoWait, ResultCode);
//
//      Exec(LastUninstallString,'', '', SW_SHOW,ewNoWait, ResultCode);
//      Result := false;
//
//    end
// else
//    begin             
//      Result := true;
//    end
end;     

function InitializeUninstall(): Boolean;
begin        
  Result := CloseApp();

end;

function GetUninstallString(): String;
var
  sUnInstPath: String;
  sUnInstallString: String;
begin
  sUnInstPath := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#emit SetupSetting("AppId")}_is1');
  sUnInstallString := '';
  if not RegQueryStringValue(HKLM, sUnInstPath, 'UninstallString', sUnInstallString) then
    RegQueryStringValue(HKCU, sUnInstPath, 'UninstallString', sUnInstallString);
  Result := sUnInstallString;
end;

function IsUpgrade(): Boolean;
begin
  Result := (GetUninstallString() <> '');
end;

function UnInstallOldVersion(): Integer;
var
  sUnInstallString: String;
  iResultCode: Integer;
begin
// Return Values:
// 1 - uninstall string is empty
// 2 - error executing the UnInstallString
// 3 - successfully executed the UnInstallString

  // default return value
  Result := 0;

  // get the uninstall string of the old app
  sUnInstallString := GetUninstallString();
  if sUnInstallString <> '' then begin
    sUnInstallString := RemoveQuotes(sUnInstallString);
    //if Exec(sUnInstallString, '/SILENT /NORESTART /SUPPRESSMSGBOXES','', SW_HIDE, ewWaitUntilTerminated, iResultCode) then
    //if ShellExec('',sUnInstallString, '/SILENT /NORESTART /SUPPRESSMSGBOXES','', SW_HIDE, ewWaitUntilTerminated, iResultCode) then
    if ShellExec('',sUnInstallString, '/VERYSILENT /NORESTART /SUPPRESSMSGBOXES','', SW_HIDE, ewWaitUntilTerminated, iResultCode) then
      Result := 3
    else
      Result := 2;
  end else
    Result := 1;
end;

procedure CurStepChanged(CurStep : TSetupStep);
begin
  if (CurStep=ssInstall) then
  begin
    if (IsUpgrade()) then
    begin
      UnInstallOldVersion();
    end; 
  end 
  else if (CurStep = ssPostInstall) then
  begin
  end 
  else if (CurStep = ssDone) then
  begin
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin         
  if (CurUninstallStep = usUninstall) then      //?çÂ?Ë£ùÂ?        
  begin   
  end                              
  else if (CurUninstallStep = usPostUninstall) then  //?çÂ?Ë£ùÂ???
  begin   
    DelTree(ExpandConstant('{userappdata}\IONE_ACTION_AIO'), True, True, True);
  end 
  else if (CurUninstallStep = usDone) then           //ÂÆåÊ?ÂæåÁ?ÂºèÈ??âÂ?   
  begin
  end;
end;


procedure InitializeUninstallProgressForm();
begin
  DelTree(ExpandConstant('{userappdata}\IONE_ACTION_AIO'), True, True, True);
end;
