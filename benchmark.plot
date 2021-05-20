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
plot filename using 2:($11/1000):($13/1000) with errorbars title 'Brotli', \
  '' using 2:($31/1000):($33/1000) with errorbars title 'Gzip', \
  '' using 2:($51/1000):($53/1000) with errorbars title 'Deflate', \
  '' using 2:($71/1000):($73/1000) with errorbars title 'No compression'

# DOWNLOAD

if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'donload.png'
}
set title "Download + decompression duration"
set ylabel "Duration"
plot filename using 2:($20/1000):($22/1000) with errorbars title 'Brotli', \
  '' using 2:($40/1000):($42/1000) with errorbars title 'Gzip', \
  '' using 2:($60/1000):($62/1000) with errorbars title 'Deflate', \
  '' using 2:($80/1000):($82/1000) with errorbars title 'No compression'

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
plot filename using 2:4 with points title 'Brotli', \
  '' using 2:24 with points title 'Gzip', \
  '' using 2:44 with points title 'Deflate', \

  
if (exists("write")){
  set terminal pngcairo size 660,440 enhanced font 'Verdana,10'
  set output 'compression.png'
}
set title "Compression duration"
set ylabel "Duration"
set format y "%.0s%cs"
set yrange [0:*]
set ytics auto
plot filename using 2:($5/1000):($7/1000) with errorbars title 'Brotli', \
  '' using 2:($25/1000):($27/1000) with errorbars title 'Gzip', \
  '' using 2:($45/1000):($47/1000) with errorbars title 'Deflate', \
