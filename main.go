package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"os/exec"
	"bufio"
	// "runtime"
	// "strings"
	// "time"
)

func main() {
	cmd := exec.Command("./TheKing350noOpk.exe")

	var stdoutBuf, stderrBuf bytes.Buffer
	cmd.Stdout = io.MultiWriter(os.Stdout, &stdoutBuf)
	cmd.Stderr = io.MultiWriter(os.Stderr, &stderrBuf)
	engine, err := cmd.StdinPipe()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	err = cmd.Start()
	if err != nil {
		fmt.Println("cmd.Run() failed with %s\n", err)
		os.Exit(1)
	}

	engine.Write([]byte("xboard\n"))
	engine.Write([]byte("post\n"))
	engine.Write([]byte("time 2000\n"))
	engine.Write([]byte("otim 2000\n"))
	engine.Write([]byte("go\n"))

	// time.Sleep(5 * time.Second)
	// stdin.Write([]byte("go\n"))

	s := bufio.NewScanner(os.Stdin)
	for s.Scan() {
		line := s.Text()
		fmt.Println(line)
		engine.Write([]byte(line + "\n"))
		if line == "quit" {
			fmt.Println("quit received, waiting for engine to quit")
			break
		}
	}

	cmd.Wait()

}

// outStr, errStr := string(stdoutBuf.Bytes()), string(stderrBuf.Bytes())
// fmt.Printf("\nout:\n%s\nerr:\n%s\n", outStr, errStr)

// for {
//   line, _, _ := stdOutBuf.ReadLine()
// 	if string(line) == "move e2e4" {
// 		os.Exit(0)
// 	}
//   fmt.Println(string(line))
// }// 	}
//   fmt.Println(string(line))
// }
