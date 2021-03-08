package main

import (
	"bufio"
	"os"
	// "log"
	// "io"
	// "strings"
	"fmt"
)

func main() {
	s := bufio.NewScanner(os.Stdin)
	for s.Scan() {
		fmt.Println(s.Text())
	}
}


// outStr, errStr := string(stdoutBuf.Bytes()), string(stderrBuf.Bytes())
// fmt.Printf("\nout:\n%s\nerr:\n%s\n", outStr, errStr)

	// for {
  //   line, _, _ := stdOutBuf.ReadLine()
	// 	if string(line) == "move e2e4" {
	// 		os.Exit(0)
	// 	}
  //   fmt.Println(string(line))
  // }