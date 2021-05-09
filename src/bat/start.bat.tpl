chcp 65001
c:
cd C:\Users\jf3096\AppData\Local\chia-blockchain\app-1.1.4\resources\app.asar.unpacked\daemon
chia plots create -r {thread} -k {kSize} -b {memoryBuffer} -u {buckets} -t "{tempFolder}" -d "{destFolder}"
echo ===complete===