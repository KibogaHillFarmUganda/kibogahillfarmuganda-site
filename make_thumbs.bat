@echo off
pushd "%~dp0"
set "SRC=Images"
set "DST=%SRC%\thumbs"
if not exist "%DST%" mkdir "%DST%"

for %%F in ("%SRC%\*.jpg" "%SRC%\*.jpeg" "%SRC%\*.png") do (
  echo Processing: %%~nxF
  magick "%%~fF" -auto-orient -strip -resize 520x  -quality 74 "%DST%\%%~nF-520.webp"
  magick "%%~fF" -auto-orient -strip -resize 1040x -quality 74 "%DST%\%%~nF-1040.webp"
)

echo Done. Thumbnails in "%DST%".
pause
