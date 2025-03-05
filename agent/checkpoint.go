package main // Add checkpointing to the Go agent

// import (
// 	"encoding/json"
// 	"io/ioutil"
// 	"log"
// 	"time"

// 	"github.com/nxadm/tail"
// )

// type Checkpoint struct {
// 	Path     string `json:"path"`
// 	Position int64  `json:"position"`
// }

// func saveCheckpoint(path string, pos int64) error {
// 	cp := Checkpoint{Path: path, Position: pos}
// 	data, _ := json.Marshal(cp)
// 	return ioutil.WriteFile("checkpoint.json", data, 0644)
// }

// func loadCheckpoint(path string) (int64, error) {
// 	data, err := ioutil.ReadFile("checkpoint.json")
// 	if err != nil {
// 		return 0, err
// 	}
// 	var cp Checkpoint
// 	json.Unmarshal(data, &cp)
// 	if cp.Path == path {
// 		return cp.Position, nil
// 	}
// 	return 0, nil
// }

// // Update tailLog to use checkpointing
// func tailLog(logConfig LogConfig, logChan chan LogMessage) {
// 	pos, err := loadCheckpoint(logConfig.Path)
// 	if err != nil {
// 		log.Printf("Failed to load checkpoint: %v", err)
// 	}

// 	t, err := tail.TailFile(logConfig.Path, tail.Config{
// 		Follow:   true,
// 		ReOpen:   true,
// 		Location: &tail.SeekInfo{Offset: pos, Whence: 0},
// 	})
// 	if err != nil {
// 		log.Printf("Failed to tail %s: %v", logConfig.Path, err)
// 		return
// 	}

// 	for line := range t.Lines {
// 		logChan <- LogMessage{
// 			Timestamp: time.Now(),
// 			Tag:       logConfig.Tag,
// 			Message:   line.Text,
// 		}
// 		// Save checkpoint after each line (or batch for efficiency)
// 		saveCheckpoint(logConfig.Path, line.Location.Offset)
// 	}
// }
