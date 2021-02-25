#!/bin/bash

declare -a books=("Bipto" "CaptureBook" "DangerDon" "Depth2" "Depth4" "Depth6" "Drawish" "FastBook" "FastLose" "Gambit" "KnightMoves" "LowCaptureBook" "MentorFrench" "MentorGerman" "Merlin" "NoBook" "OldBook" "PawnMoves" "SlowBook" "Strong" "Trappee" "Trapper" "Unorthodox" "Weak")

for book in "${books[@]}"
do 
  echo moving "zz$book.bin to $book.bin" 
  mv zz$book.bin $book.bin
  # echo "Translating $book "
  # ./obk2bin.exe $book
done