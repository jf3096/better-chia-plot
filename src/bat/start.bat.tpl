chcp 65001
c:
cd C:\Users\ChampbinPC\AppData\Local\chia-blockchain\app-1.1.4\resources\app.asar.unpacked\daemon
chia plots create -r {thread} -k {kSize} -b {memoryBuffer} -u {buckets} -t "{tempFolder}" -2 "{tempFolder2}" -d "{destFolder}"
echo ===complete===