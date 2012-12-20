#!/bin/bash
rm -rf ./TapTunnel
mkdir TapTunnel;
./bundle.sh --name=TapTunnel --displayname="Tap Tunnel" --bundle-identifier=com.browsertap.taptunnel
cp -R ./dist/TapTunnel.app ./TapTunnel;
ln -s /Applications ./TapTunnel/Applications
hdiutil create ./TapTunnel/TapTunnel.dmg -srcfolder ./TapTunnel -ov
rm -rf ./dist
