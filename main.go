package main

import (
	// "bufio"
	"fmt"
	"io"
	"os"
	"os/exec"
  "bytes"
	"time"
  // "runtime"
	// "strings"
)

func main() {
	cmd := exec.Command("./TheKing350noOpk.exe")

	var stdoutBuf, stderrBuf, stdin bytes.Buffer
	cmd.Stdout = io.MultiWriter(os.Stdout, &stdoutBuf)
	cmd.Stderr = io.MultiWriter(os.Stderr, &stderrBuf)
	cmd.Stdin = &stdin

	stdin.Write([]byte("xboard\n"))
	stdin.Write([]byte("post\n"))
	stdin.Write([]byte("time 2000\n"))
	stdin.Write([]byte("otim 2000\n"))
	stdin.Write([]byte("go\n"))


	err := cmd.Start()
	if err != nil {
		fmt.Println("cmd.Run() failed with %s\n", err)
		os.Exit(1)
	}

	time.Sleep(5 * time.Second)
	stdin.Write([]byte("quit\n"))

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