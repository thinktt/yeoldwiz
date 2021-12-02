package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"os/exec"
	"bufio"
)

func main() {
	shouldPostInput := os.Getenv("SHOULD_POST_INPUT")
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

	fmt.Println("Engine wrapper started, waiting for commands")
	s := bufio.NewScanner(os.Stdin)
	for s.Scan() {
		line := s.Text()
		if shouldPostInput == "true" {
			fmt.Printf("In: " + line + "\n")
		}
		engine.Write([]byte(line + "\n"))
		if line == "quit" {
			fmt.Println("quit received, waiting for engine to quit")
			break
		}
	}

	cmd.Wait()
}