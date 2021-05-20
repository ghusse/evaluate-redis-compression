# Use Gnuplot to generate graphics from benchmark results

if (!exists("filename")) filename='result.csv'

# UPLOAD

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'upload.png'
}

set xlabel "Document size"
set format x "%.0s%cB"
set format y "%.1s%cs"
set yrange [0:*]
set datafile separator ','
set title "Compression + upload duration"
set ylabel "Duration"
set key outside
plot filename using 2:(column("brotliTotalSetValueMean")/1000):(column("brotliTotalSetValue95")/1000) with errorbars title 'Brotli', \
  '' using 2:(column("gzipTotalSetValueMean")/1000):(column("gzipTotalSetValue95")/1000) with errorbars title 'Gzip', \
  '' using 2:(column("deflateTotalSetValueMean")/1000):(column("deflateTotalSetValue95")/1000) with errorbars title 'Deflate', \
  '' using 2:(column("noneTotalSetValueMean")/1000):(column("noneTotalSetValue95")/1000) with errorbars title 'No compression'

# DOWNLOAD

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'donload.png'
}
set title "Download + decompression duration"
set ylabel "Duration"
plot filename using 2:(column("brotliTotalGetValueMean")/1000):(column("brotliTotalGetValue95")/1000) with errorbars title 'Brotli', \
  '' using 2:(column("gzipTotalGetValueMean")/1000):(column("gzipTotalGetValue95")/1000) with errorbars title 'Gzip', \
  '' using 2:(column("deflateTotalGetValueMean")/1000):(column("deflateTotalGetValue95")/1000) with errorbars title 'Deflate', \
  '' using 2:(column("noneTotalGetValueMean")/1000):(column("noneTotalGetValue95")/1000) with errorbars title 'No compression'

# Compression

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'space-saving.png'
}
set title "Space saving"
set ylabel "Space saving"
set format y "%g%%"
set yrange [*:*]
set ytics 1
plot filename using 2:"brotliSizeSaving" with points title 'Brotli', \
  '' using 2:"gzipSizeSaving" with points title 'Gzip', \
  '' using 2:"deflateSizeSaving" with points title 'Deflate', \

  
if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'compression.png'
}
set title "Compression duration"
set ylabel "Duration"
set format y "%.0s%cs"
set yrange [0:*]
set ytics auto
plot filename using 2:(column("brotliCompressionMean")/1000):(column("brotliCompression95")/1000) with errorbars title 'Brotli', \
  '' using 2:(column("gzipCompressionMean")/1000):(column("gzipCompression95")/1000) with errorbars title 'Gzip', \
  '' using 2:(column("deflateCompressionMean")/1000):(column("deflateCompression95")/1000) with errorbars title 'Deflate', \
