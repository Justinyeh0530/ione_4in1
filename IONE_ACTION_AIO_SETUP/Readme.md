electron打包到APP資料夾底下打 :
electron-packager ./ IONE_ACTION_AIO --platform=win32 --arch=x64 --electron-version=4.0.4 --icon=./image/icon.ico --asar




1. Inno Setup 主程式下載連結 http://www.jrsoftware.org/download.php/is.exe
2. 安裝主程式
3. 將打包好的IONE_ACTION_AIO-win32-x64及IONE_ACTION_AIO-win32-ia32資料夾放入bk700-Ng2>inno setup>files資料夾內
4. 執行 Setup_English.iss > Build > Compile
5. Compile 完畢後資料會在 Output 資料夾內
6. 將版本號改上去，例如 bk700Setup-20180918_A.exe

(X64)安裝包說明:
1.將打包後的IONE_ACTION_AIO-win32-x64 裡面的所有檔案COPY到IONE_ACTION_AIO_SETUP\Files資料夾內
2.打開ione_3in1setup.iss
3.點選compile(熱鍵Ctrl+F9)
4.在IONE_ACTION_AIO_SETUP\Setup資料夾看見安裝檔

P.S: 如果要取代FILE裡面的檔案 記得icon.ico不要刪掉