rmdir dist /s /q
mkdir dist
copy "web.config" "dist/"
copy "package.json" "dist/"
copy "build.bat" "dist/"
npm run build:iis