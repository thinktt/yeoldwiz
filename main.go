package main

import (
	// "bufio"
	"fmt"
	"io"
	"os"
	"os/exec"
    "bytes"
    "runtime"
	// "strings"
)

func main() {
	cmd := exec.Command("bash", "slowout.sh")
	if runtime.GOOS == "windows" {
		cmd = exec.Command("tasklist")
	}

	var stdoutBuf, stderrBuf bytes.Buffer
	cmd.Stdout = io.MultiWriter(os.Stdout, &stdoutBuf)
	cmd.Stderr = io.MultiWriter(os.Stderr, &stderrBuf)

	err := cmd.Run()
	if err != nil {
		fmt.Println("cmd.Run() failed with %s\n", err)
	}
	// outStr, errStr := string(stdoutBuf.Bytes()), string(stderrBuf.Bytes())
	// fmt.Printf("\nout:\n%s\nerr:\n%s\n", outStr, errStr)
}