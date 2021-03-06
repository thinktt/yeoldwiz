package main

package main

import (
    "bufio"
    "fmt"
    "os/exec"
    "strings"
)

func main() {
    // args := "-i test.mp4 -acodec copy -vcodec copy -f flv rtmp://aaa/bbb"
    // cmd := exec.Command("ffmpeg", strings.Split(args, " ")...)
    cmd := exec.Command("ffmpeg", strings.Split(args, " ")...)


    stderr, _ := cmd.StderrPipe()
    cmd.Start()

    scanner := bufio.NewScanner(stderr)
    scanner.Split(bufio.ScanWords)
    for scanner.Scan() {
        m := scanner.Text()
        fmt.Println(m)
    }
    cmd.Wait()
}