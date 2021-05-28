# Use Gnuplot to generate graphics from benchmark results

# Basic conf
set style line 101 lc rgb '#666666' lt 1 lw 1
set border 3 front ls 101
set tics nomirror out scale 0.75

set grid ytics mytics  # draw lines for each ytics and mytics
set mytics 1           # set the spacing for the mytics
set grid               # enable the grid
set errorbars small linewidth 1.5 dashtype '.'

if (!exists("filename")) filename='result.csv'

# UPLOAD

set xlabel "Document size" textcolor linestyle 101
set format x "%.0s%cB"
set format y "%.1s%cs"
set yrange [0:*]
set datafile separator ','
set title "Serialization + compression + upload duration"
set ylabel "Duration" textcolor linestyle 101
set key outside textcolor linestyle 101

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'upload-brotli.png'
}

plot filename using 2:(column("brotli1TotalSetValueMsMean")/1000):(column("brotli1TotalSetValueMs95")/1000) with errorbars title 'Brotli 1', \
  '' using 2:(column("brotli2TotalSetValueMsMean")/1000):(column("brotli2TotalSetValueMs95")/1000) with errorbars title 'Brotli 2', \
  '' using 2:(column("brotli3TotalSetValueMsMean")/1000):(column("brotli3TotalSetValueMs95")/1000) with errorbars title 'Brotli 3', \
  '' using 2:(column("brotli5TotalSetValueMsMean")/1000):(column("brotli5TotalSetValueMs95")/1000) with errorbars title 'Brotli 5', \
  '' using 2:(column("brotli6TotalSetValueMsMean")/1000):(column("brotli6TotalSetValueMs95")/1000) with errorbars title 'Brotli 6', \
  '' using 2:(column("brotli7TotalSetValueMsMean")/1000):(column("brotli7TotalSetValueMs95")/1000) with errorbars title 'Brotli 7', \
  '' using 2:(column("brotli8TotalSetValueMsMean")/1000):(column("brotli8TotalSetValueMs95")/1000) with errorbars title 'Brotli 8', \
  '' using 2:(column("brotli9TotalSetValueMsMean")/1000):(column("brotli9TotalSetValueMs95")/1000) with errorbars title 'Brotli 9', \
  '' using 2:(column("brotli10TotalSetValueMsMean")/1000):(column("brotli10TotalSetValueMs95")/1000) with errorbars title 'Brotli 10', \
  '' using 2:(column("brotli11TotalSetValueMsMean")/1000):(column("brotli11TotalSetValueMs95")/1000) with errorbars title 'Brotli 11', \
  '' using 2:(column("noneTotalSetValueMsMean")/1000):(column("noneTotalSetValueMs95")/1000) with errorbars title 'none'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'upload-brotli-fast.png'
}

plot filename using 2:(column("brotli1TotalSetValueMsMean")/1000):(column("brotli1TotalSetValueMs95")/1000) with errorbars title 'Brotli 1', \
  '' using 2:(column("brotli2TotalSetValueMsMean")/1000):(column("brotli2TotalSetValueMs95")/1000) with errorbars title 'Brotli 2', \
  '' using 2:(column("brotli3TotalSetValueMsMean")/1000):(column("brotli3TotalSetValueMs95")/1000) with errorbars title 'Brotli 3', \
  '' using 2:(column("brotli5TotalSetValueMsMean")/1000):(column("brotli5TotalSetValueMs95")/1000) with errorbars title 'Brotli 5', \
  '' using 2:(column("brotli6TotalSetValueMsMean")/1000):(column("brotli6TotalSetValueMs95")/1000) with errorbars title 'Brotli 6', \
  '' using 2:(column("brotli7TotalSetValueMsMean")/1000):(column("brotli7TotalSetValueMs95")/1000) with errorbars title 'Brotli 7', \
  '' using 2:(column("brotli8TotalSetValueMsMean")/1000):(column("brotli8TotalSetValueMs95")/1000) with errorbars title 'Brotli 8', \
  '' using 2:(column("brotli9TotalSetValueMsMean")/1000):(column("brotli9TotalSetValueMs95")/1000) with errorbars title 'Brotli 9', \
  '' using 2:(column("noneTotalSetValueMsMean")/1000):(column("noneTotalSetValueMs95")/1000) with errorbars title 'none'


if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'upload-gzip.png'
}

plot filename using 2:(column("gzip-1TotalSetValueMsMean")/1000):(column("gzip-1TotalSetValueMs95")/1000) with errorbars title 'gzip -1', \
  '' using 2:(column("gzip1TotalSetValueMsMean")/1000):(column("gzip1TotalSetValueMs95")/1000) with errorbars title 'gzip 1', \
  '' using 2:(column("gzip2TotalSetValueMsMean")/1000):(column("gzip2TotalSetValueMs95")/1000) with errorbars title 'gzip 2', \
  '' using 2:(column("gzip3TotalSetValueMsMean")/1000):(column("gzip3TotalSetValueMs95")/1000) with errorbars title 'gzip 3', \
  '' using 2:(column("gzip4TotalSetValueMsMean")/1000):(column("gzip4TotalSetValueMs95")/1000) with errorbars title 'gzip 4', \
  '' using 2:(column("gzip5TotalSetValueMsMean")/1000):(column("gzip5TotalSetValueMs95")/1000) with errorbars title 'gzip 5', \
  '' using 2:(column("gzip6TotalSetValueMsMean")/1000):(column("gzip6TotalSetValueMs95")/1000) with errorbars title 'gzip 6', \
  '' using 2:(column("gzip7TotalSetValueMsMean")/1000):(column("gzip7TotalSetValueMs95")/1000) with errorbars title 'gzip 7', \
  '' using 2:(column("gzip8TotalSetValueMsMean")/1000):(column("gzip8TotalSetValueMs95")/1000) with errorbars title 'gzip 8', \
  '' using 2:(column("gzip9TotalSetValueMsMean")/1000):(column("gzip9TotalSetValueMs95")/1000) with errorbars title 'gzip 9', \
  '' using 2:(column("noneTotalSetValueMsMean")/1000):(column("noneTotalSetValueMs95")/1000) with errorbars title 'none'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'upload-deflate.png'
}

plot filename using 2:(column("deflate-1TotalSetValueMsMean")/1000):(column("deflate-1TotalSetValueMs95")/1000) with errorbars title 'deflate -1', \
  '' using 2:(column("deflate1TotalSetValueMsMean")/1000):(column("deflate1TotalSetValueMs95")/1000) with errorbars title 'deflate 1', \
  '' using 2:(column("deflate2TotalSetValueMsMean")/1000):(column("deflate2TotalSetValueMs95")/1000) with errorbars title 'deflate 2', \
  '' using 2:(column("deflate3TotalSetValueMsMean")/1000):(column("deflate3TotalSetValueMs95")/1000) with errorbars title 'deflate 3', \
  '' using 2:(column("deflate4TotalSetValueMsMean")/1000):(column("deflate4TotalSetValueMs95")/1000) with errorbars title 'deflate 4', \
  '' using 2:(column("deflate5TotalSetValueMsMean")/1000):(column("deflate5TotalSetValueMs95")/1000) with errorbars title 'deflate 5', \
  '' using 2:(column("deflate6TotalSetValueMsMean")/1000):(column("deflate6TotalSetValueMs95")/1000) with errorbars title 'deflate 6', \
  '' using 2:(column("deflate7TotalSetValueMsMean")/1000):(column("deflate7TotalSetValueMs95")/1000) with errorbars title 'deflate 7', \
  '' using 2:(column("deflate8TotalSetValueMsMean")/1000):(column("deflate8TotalSetValueMs95")/1000) with errorbars title 'deflate 8', \
  '' using 2:(column("deflate9TotalSetValueMsMean")/1000):(column("deflate9TotalSetValueMs95")/1000) with errorbars title 'deflate 9', \
  '' using 2:(column("noneTotalSetValueMsMean")/1000):(column("noneTotalSetValueMs95")/1000) with errorbars title 'none'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'upload.png'
}

plot filename using 2:(column("brotli5TotalSetValueMsMean")/1000):(column("brotli5TotalSetValueMs95")/1000) with errorbars title 'brotli 5', \
  '' using 2:(column("deflate6TotalSetValueMsMean")/1000):(column("deflate6TotalSetValueMs95")/1000) with errorbars title 'deflate 6', \
  '' using 2:(column("gzip6TotalSetValueMsMean")/1000):(column("gzip6TotalSetValueMs95")/1000) with errorbars title 'gzip 6', \
  '' using 2:(column("msgPackTotalSetValueMsMean")/1000):(column("msgPackTotalSetValueMs95")/1000) with errorbars title 'msgpack', \
  '' using 2:(column("noneTotalSetValueMsMean")/1000):(column("noneTotalSetValueMs95")/1000) with errorbars title 'none'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'upload-msgpack.png'
}

plot filename using 2:(column("msgPackTotalSetValueMsMean")/1000):(column("msgPackTotalSetValueMs95")/1000) with errorbars title 'msgpack', \
  '' using 2:(column("noneTotalSetValueMsMean")/1000):(column("noneTotalSetValueMs95")/1000) with errorbars title 'none'


if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'upload-challengers.png'
}

plot filename using 2:(column("brotli1TotalSetValueMsMean")/1000):(column("brotli1TotalSetValueMs95")/1000) with errorbars title 'brotli 1', \
  '' using 2:(column("deflate3TotalSetValueMsMean")/1000):(column("deflate3TotalSetValueMs95")/1000) with errorbars title 'deflate 3', \
  '' using 2:(column("gzip3TotalSetValueMsMean")/1000):(column("gzip3TotalSetValueMs95")/1000) with errorbars title 'gzip 3'

set title "Compression duration"

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'compression-time.png'
}

plot filename using 2:(column("brotli5CompressionTimeMsMean")/1000):(column("brotli5CompressionTimeMs95")/1000) with errorbars title 'brotli 5', \
  '' using 2:(column("deflate6CompressionTimeMsMean")/1000):(column("deflate6CompressionTimeMs95")/1000) with errorbars title 'deflate 6', \
  '' using 2:(column("gzip6CompressionTimeMsMean")/1000):(column("gzip6CompressionTimeMs95")/1000) with errorbars title 'gzip 6'


# DOWNLOAD

set title "Download + decompression + parsing duration"
set ylabel "Duration"

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'download-brotli.png'
}

plot filename using 2:(column("brotli1TotalGetValueMsMean")/1000):(column("brotli1TotalGetValueMs95")/1000) with errorbars title 'Brotli 1', \
  '' using 2:(column("brotli2TotalGetValueMsMean")/1000):(column("brotli2TotalGetValueMs95")/1000) with errorbars title 'Brotli 2', \
  '' using 2:(column("brotli3TotalGetValueMsMean")/1000):(column("brotli3TotalGetValueMs95")/1000) with errorbars title 'Brotli 3', \
  '' using 2:(column("brotli5TotalGetValueMsMean")/1000):(column("brotli5TotalGetValueMs95")/1000) with errorbars title 'Brotli 5', \
  '' using 2:(column("brotli6TotalGetValueMsMean")/1000):(column("brotli6TotalGetValueMs95")/1000) with errorbars title 'Brotli 6', \
  '' using 2:(column("brotli7TotalGetValueMsMean")/1000):(column("brotli7TotalGetValueMs95")/1000) with errorbars title 'Brotli 7', \
  '' using 2:(column("brotli8TotalGetValueMsMean")/1000):(column("brotli8TotalGetValueMs95")/1000) with errorbars title 'Brotli 8', \
  '' using 2:(column("brotli9TotalGetValueMsMean")/1000):(column("brotli9TotalGetValueMs95")/1000) with errorbars title 'Brotli 9', \
  '' using 2:(column("brotli10TotalGetValueMsMean")/1000):(column("brotli10TotalGetValueMs95")/1000) with errorbars title 'Brotli 10', \
  '' using 2:(column("brotli11TotalGetValueMsMean")/1000):(column("brotli11TotalGetValueMs95")/1000) with errorbars title 'Brotli 11', \
  '' using 2:(column("noneTotalGetValueMsMean")/1000):(column("noneTotalGetValueMs95")/1000) with errorbars title 'none'


if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'download-gzip.png'
}

plot filename using 2:(column("gzip-1TotalGetValueMsMean")/1000):(column("gzip-1TotalGetValueMs95")/1000) with errorbars title 'gzip -1', \
  '' using 2:(column("gzip1TotalGetValueMsMean")/1000):(column("gzip1TotalGetValueMs95")/1000) with errorbars title 'gzip 1', \
  '' using 2:(column("gzip2TotalGetValueMsMean")/1000):(column("gzip2TotalGetValueMs95")/1000) with errorbars title 'gzip 2', \
  '' using 2:(column("gzip3TotalGetValueMsMean")/1000):(column("gzip3TotalGetValueMs95")/1000) with errorbars title 'gzip 3', \
  '' using 2:(column("gzip4TotalGetValueMsMean")/1000):(column("gzip4TotalGetValueMs95")/1000) with errorbars title 'gzip 4', \
  '' using 2:(column("gzip5TotalGetValueMsMean")/1000):(column("gzip5TotalGetValueMs95")/1000) with errorbars title 'gzip 5', \
  '' using 2:(column("gzip6TotalGetValueMsMean")/1000):(column("gzip6TotalGetValueMs95")/1000) with errorbars title 'gzip 6', \
  '' using 2:(column("gzip7TotalGetValueMsMean")/1000):(column("gzip7TotalGetValueMs95")/1000) with errorbars title 'gzip 7', \
  '' using 2:(column("gzip8TotalGetValueMsMean")/1000):(column("gzip8TotalGetValueMs95")/1000) with errorbars title 'gzip 8', \
  '' using 2:(column("gzip9TotalGetValueMsMean")/1000):(column("gzip9TotalGetValueMs95")/1000) with errorbars title 'gzip 9', \
  '' using 2:(column("noneTotalGetValueMsMean")/1000):(column("noneTotalGetValueMs95")/1000) with errorbars title 'none'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'download-deflate.png'
}

plot filename using 2:(column("deflate-1TotalGetValueMsMean")/1000):(column("deflate-1TotalGetValueMs95")/1000) with errorbars title 'deflate -1', \
  '' using 2:(column("deflate1TotalGetValueMsMean")/1000):(column("deflate1TotalGetValueMs95")/1000) with errorbars title 'deflate 1', \
  '' using 2:(column("deflate2TotalGetValueMsMean")/1000):(column("deflate2TotalGetValueMs95")/1000) with errorbars title 'deflate 2', \
  '' using 2:(column("deflate3TotalGetValueMsMean")/1000):(column("deflate3TotalGetValueMs95")/1000) with errorbars title 'deflate 3', \
  '' using 2:(column("deflate4TotalGetValueMsMean")/1000):(column("deflate4TotalGetValueMs95")/1000) with errorbars title 'deflate 4', \
  '' using 2:(column("deflate5TotalGetValueMsMean")/1000):(column("deflate5TotalGetValueMs95")/1000) with errorbars title 'deflate 5', \
  '' using 2:(column("deflate6TotalGetValueMsMean")/1000):(column("deflate6TotalGetValueMs95")/1000) with errorbars title 'deflate 6', \
  '' using 2:(column("deflate7TotalGetValueMsMean")/1000):(column("deflate7TotalGetValueMs95")/1000) with errorbars title 'deflate 7', \
  '' using 2:(column("deflate8TotalGetValueMsMean")/1000):(column("deflate8TotalGetValueMs95")/1000) with errorbars title 'deflate 8', \
  '' using 2:(column("deflate9TotalGetValueMsMean")/1000):(column("deflate9TotalGetValueMs95")/1000) with errorbars title 'deflate 9', \
  '' using 2:(column("noneTotalGetValueMsMean")/1000):(column("noneTotalGetValueMs95")/1000) with errorbars title 'none'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'download-deflate-only.png'
}

plot filename using 2:(column("deflate-1TotalGetValueMsMean")/1000):(column("deflate-1TotalGetValueMs95")/1000) with errorbars title 'deflate -1', \
  '' using 2:(column("deflate1TotalGetValueMsMean")/1000):(column("deflate1TotalGetValueMs95")/1000) with errorbars title 'deflate 1', \
  '' using 2:(column("deflate2TotalGetValueMsMean")/1000):(column("deflate2TotalGetValueMs95")/1000) with errorbars title 'deflate 2', \
  '' using 2:(column("deflate3TotalGetValueMsMean")/1000):(column("deflate3TotalGetValueMs95")/1000) with errorbars title 'deflate 3', \
  '' using 2:(column("deflate4TotalGetValueMsMean")/1000):(column("deflate4TotalGetValueMs95")/1000) with errorbars title 'deflate 4', \
  '' using 2:(column("deflate5TotalGetValueMsMean")/1000):(column("deflate5TotalGetValueMs95")/1000) with errorbars title 'deflate 5', \
  '' using 2:(column("deflate6TotalGetValueMsMean")/1000):(column("deflate6TotalGetValueMs95")/1000) with errorbars title 'deflate 6', \
  '' using 2:(column("deflate7TotalGetValueMsMean")/1000):(column("deflate7TotalGetValueMs95")/1000) with errorbars title 'deflate 7', \
  '' using 2:(column("deflate8TotalGetValueMsMean")/1000):(column("deflate8TotalGetValueMs95")/1000) with errorbars title 'deflate 8', \
  '' using 2:(column("deflate9TotalGetValueMsMean")/1000):(column("deflate9TotalGetValueMs95")/1000) with errorbars title 'deflate 9'


if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'download.png'
}

plot filename using 2:(column("brotli5TotalGetValueMsMean")/1000):(column("brotli5TotalGetValueMs95")/1000) with errorbars title 'brotli 5', \
  '' using 2:(column("deflate6TotalGetValueMsMean")/1000):(column("deflate6TotalGetValueMs95")/1000) with errorbars title 'deflate 6', \
  '' using 2:(column("gzip6TotalGetValueMsMean")/1000):(column("gzip6TotalGetValueMs95")/1000) with errorbars title 'gzip 6', \
  '' using 2:(column("msgPackTotalGetValueMsMean")/1000):(column("msgPackTotalGetValueMs95")/1000) with errorbars title 'msgpack', \
  '' using 2:(column("noneTotalGetValueMsMean")/1000):(column("noneTotalGetValueMs95")/1000) with errorbars title 'none'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'download-msgpack.png'
}


plot filename using 2:(column("msgPackTotalGetValueMsMean")/1000):(column("msgPackTotalGetValueMs95")/1000) with errorbars title 'msgpack', \
  '' using 2:(column("noneTotalGetValueMsMean")/1000):(column("noneTotalGetValueMs95")/1000) with errorbars title 'none'


if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'download-challengers.png'
}

plot filename using 2:(column("brotli1TotalGetValueMsMean")/1000):(column("brotli1TotalGetValueMs95")/1000) with errorbars title 'brotli 1', \
  '' using 2:(column("deflate3TotalGetValueMsMean")/1000):(column("deflate3TotalGetValueMs95")/1000) with errorbars title 'deflate 3', \
  '' using 2:(column("gzip3TotalGetValueMsMean")/1000):(column("gzip3TotalGetValueMs95")/1000) with errorbars title 'gzip 3'

set title "Decompression duration"

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'decompression-time.png'
}

plot filename using 2:(column("brotli5DecompressionTimeMsMean")/1000):(column("brotli5DecompressionTimeMs95")/1000) with errorbars title 'brotli 5', \
  '' using 2:(column("deflate6DecompressionTimeMsMean")/1000):(column("deflate6DecompressionTimeMs95")/1000) with errorbars title 'deflate 6', \
  '' using 2:(column("gzip6DecompressionTimeMsMean")/1000):(column("gzip6DecompressionTimeMs95")/1000) with errorbars title 'gzip 6'



# Compression

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'space-saving-challengers.png'
}
set title "Space saving"
set ylabel "Space saving"
set format y "%g%%"
set yrange [*:*]
set ytics auto
plot filename using 2:"brotli5SizeSaving" with points title 'brotli 5', \
  '' using 2:"gzip6SizeSaving" with points title 'gzip 6', \
  '' using 2:"deflate6SizeSaving" with points title 'deflate 6', \
  '' using 2:"msgPackSizeSaving" with points title 'msgpack'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'space-saving-challengers-best.png'
}
set title "Space saving"
set ylabel "Space saving"
set format y "%g%%"
set yrange [*:*]
set ytics auto
plot filename using 2:"brotli5SizeSaving" with points title 'brotli 5', \
  '' using 2:"gzip6SizeSaving" with points title 'gzip 6', \
  '' using 2:"deflate6SizeSaving" with points title 'deflate 6'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'space-saving.png'
}
set title "Space saving"
set ylabel "Space saving"
set format y "%g%%"
set yrange [*:*]
set ytics auto
plot filename using 2:"brotli1SizeSaving" with points title 'brotli 1', \
  '' using 2:"brotli11SizeSaving" with points title 'brotli 11', \
  '' using 2:"gzip-1SizeSaving" with points title 'gzip -1', \
  '' using 2:"gzip9SizeSaving" with points title 'gzip 9', \
  '' using 2:"deflate-1SizeSaving" with points title 'deflate -1', \
  '' using 2:"deflate9SizeSaving" with points title 'deflate 9'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'space-saving-brotli.png'
}
set title "Space saving"
set ylabel "Space saving"
set format y "%g%%"
set yrange [*:*]
set ytics 1
plot filename using 2:"brotli1SizeSaving" with points title 'brotli 1', \
  '' using 2:"brotli2SizeSaving" with points title 'brotli 2', \
  '' using 2:"brotli3SizeSaving" with points title 'brotli 3', \
  '' using 2:"brotli4SizeSaving" with points title 'brotli 4', \
  '' using 2:"brotli5SizeSaving" with points title 'brotli 5', \
  '' using 2:"brotli6SizeSaving" with points title 'brotli 6', \
  '' using 2:"brotli7SizeSaving" with points title 'brotli 7', \
  '' using 2:"brotli8SizeSaving" with points title 'brotli 8', \
  '' using 2:"brotli9SizeSaving" with points title 'brotli 9', \
  '' using 2:"brotli10SizeSaving" with points title 'brotli 10', \
  '' using 2:"brotli11SizeSaving" with points title 'brotli 11'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'space-saving-gzip.png'
}
set title "Space saving"
set ylabel "Space saving"
set format y "%g%%"
set yrange [*:*]
set ytics auto
plot filename using 2:"gzip-1SizeSaving" with points title 'gzip -1', \
  '' using 2:"gzip0SizeSaving" with points title 'gzip 0', \
  '' using 2:"gzip1SizeSaving" with points title 'gzip 1', \
  '' using 2:"gzip2SizeSaving" with points title 'gzip 2', \
  '' using 2:"gzip3SizeSaving" with points title 'gzip 3', \
  '' using 2:"gzip4SizeSaving" with points title 'gzip 4', \
  '' using 2:"gzip5SizeSaving" with points title 'gzip 5', \
  '' using 2:"gzip6SizeSaving" with points title 'gzip 6', \
  '' using 2:"gzip7SizeSaving" with points title 'gzip 7', \
  '' using 2:"gzip8SizeSaving" with points title 'gzip 8', \
  '' using 2:"gzip9SizeSaving" with points title 'gzip 9'

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'space-saving-deflate.png'
}
set title "Space saving"
set ylabel "Space saving"
set format y "%g%%"
set yrange [*:*]
set ytics auto
plot filename using 2:"deflate-1SizeSaving" with points title 'deflate -1', \
  '' using 2:"deflate0SizeSaving" with points title 'deflate 0', \
  '' using 2:"deflate1SizeSaving" with points title 'deflate 1', \
  '' using 2:"deflate2SizeSaving" with points title 'deflate 2', \
  '' using 2:"deflate3SizeSaving" with points title 'deflate 3', \
  '' using 2:"deflate4SizeSaving" with points title 'deflate 4', \
  '' using 2:"deflate5SizeSaving" with points title 'deflate 5', \
  '' using 2:"deflate6SizeSaving" with points title 'deflate 6', \
  '' using 2:"deflate7SizeSaving" with points title 'deflate 7', \
  '' using 2:"deflate8SizeSaving" with points title 'deflate 8', \
  '' using 2:"deflate9SizeSaving" with points title 'deflate 9'

# if (exists("write")){
#   set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
#   set output 'compression.png'
# }
# set title "Compression duration"
# set ylabel "Duration"
# set format y "%.0s%cs"
# set yrange [0:*]
# set ytics auto
# plot filename using 2:(column("brotliCompressionMean")/1000):(column("brotliCompression95")/1000) with errorbars title 'Brotli', \
#   '' using 2:(column("gzipCompressionMean")/1000):(column("gzipCompression95")/1000) with errorbars title 'Gzip', \
#   '' using 2:(column("deflateCompressionMean")/1000):(column("deflateCompression95")/1000) with errorbars title 'Deflate', \
