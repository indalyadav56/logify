// Package registry persists file-tail read offsets so the agent resumes where
// it left off across restarts instead of re-shipping or skipping logs.
package registry

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// State is the per-file checkpoint. Inode/Device fingerprint the physical file
// so we can detect rotation (same path, new file) and truncation.
type State struct {
	Offset int64  `json:"offset"`
	Inode  uint64 `json:"inode"`
	Device uint64 `json:"device"`
}

// Registry is an in-memory map of file path -> State backed by a JSON file.
// It is safe for concurrent use.
type Registry struct {
	path string

	mu    sync.Mutex
	state map[string]State
	dirty bool
}

// Open loads the registry from path. A missing file yields an empty registry.
func Open(path string) (*Registry, error) {
	r := &Registry{path: path, state: map[string]State{}}
	raw, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return r, nil
		}
		return nil, err
	}
	if len(raw) > 0 {
		if err := json.Unmarshal(raw, &r.state); err != nil {
			return nil, err
		}
	}
	return r, nil
}

// Get returns the stored state for a path and whether it was present.
func (r *Registry) Get(path string) (State, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	s, ok := r.state[path]
	return s, ok
}

// Set records the state for a path and marks the registry dirty.
func (r *Registry) Set(path string, s State) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if cur, ok := r.state[path]; !ok || cur != s {
		r.state[path] = s
		r.dirty = true
	}
}

// Flush atomically writes the registry to disk if it changed since the last
// flush. It is a no-op when nothing changed.
func (r *Registry) Flush() error {
	r.mu.Lock()
	if !r.dirty {
		r.mu.Unlock()
		return nil
	}
	snapshot := make(map[string]State, len(r.state))
	for k, v := range r.state {
		snapshot[k] = v
	}
	r.dirty = false
	r.mu.Unlock()

	if dir := filepath.Dir(r.path); dir != "" {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return err
		}
	}
	data, err := json.MarshalIndent(snapshot, "", "  ")
	if err != nil {
		return err
	}
	tmp := r.path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, r.path)
}
