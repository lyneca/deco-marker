#!/bin/zsh
mkdir zips
unzip submissions.zip -d zips

mkdir extracted

for f in zips/*.zip; do
    mkdir "extracted/$f:t:r"
    unzip $f -d "extracted/$f:t:r"
done

mkdir -p pdfs
mv zips/*.pdf pdfs

find extracted -name "*.zip" | while read filename; do unzip -o -d "`dirname "$filename"`" "$filename"; done;
