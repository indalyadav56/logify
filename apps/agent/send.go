package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"os"
	"time"

	logify "github.com/indalyadav56/logify/sdks/go"
)

func cmdSend(args []string) error {
	fs := flag.NewFlagSet("send", flag.ExitOnError)
	var (
		url       = fs.String("url", envOr("LOGIFY_URL", "http://localhost:8080"), "backend base URL")
		apiKey    = fs.String("api-key", os.Getenv("LOGIFY_API_KEY"), "X-API-Key")
		level     = fs.String("level", "INFO", "log level")
		message   = fs.String("message", "", "log message (if empty, read lines from stdin)")
		service   = fs.String("service", "", "service name")
		namespace = fs.String("namespace", "", "service namespace")
		env       = fs.String("env", "", "environment")
		project   = fs.String("project", "", "project ID")
		source    = fs.String("source", "logify-cli", "source")
		hostname  = fs.String("hostname", "", "hostname (defaults to os hostname)")
		timeout   = fs.Duration("timeout", 10*time.Second, "per-request timeout")
	)
	tags := kvFlag{}
	meta := kvFlag{}
	fs.Var(tags, "tag", "tag key=value (repeatable)")
	fs.Var(meta, "meta", "metadata key=value (repeatable)")
	fs.Usage = func() {
		fmt.Fprint(os.Stderr, "Usage: logify-agent send [flags]\n\nSend a single log with --message, or pipe lines via stdin.\n\nFlags:\n")
		fs.PrintDefaults()
	}
	if err := fs.Parse(args); err != nil {
		return err
	}

	opts := []logify.Option{
		logify.WithBaseURL(*url),
		logify.WithTimeout(*timeout),
		logify.WithUserAgent("logify-cli"),
		logify.WithSource(*source),
	}
	if *apiKey != "" {
		opts = append(opts, logify.WithAPIKey(*apiKey))
	}
	if *service != "" {
		opts = append(opts, logify.WithService(*service))
	}
	if *namespace != "" {
		opts = append(opts, logify.WithNamespace(*namespace))
	}
	if *env != "" {
		opts = append(opts, logify.WithEnvironment(*env))
	}
	if *project != "" {
		opts = append(opts, logify.WithProjectID(*project))
	}
	if *hostname != "" {
		opts = append(opts, logify.WithHostname(*hostname))
	}
	if len(tags) > 0 {
		opts = append(opts, logify.WithDefaultTags(tags))
	}

	client, err := logify.New(opts...)
	if err != nil {
		return err
	}
	defer client.Close(context.Background())

	ctx := context.Background()
	lvl := logify.Level(*level)

	// metadata as map[string]any for the entry options
	var entryOpts []logify.EntryOption
	for k, v := range meta {
		entryOpts = append(entryOpts, logify.WithEntryMetadataValue(k, v))
	}

	// Direct message mode.
	if *message != "" {
		return client.Log(ctx, lvl, *message, entryOpts...)
	}

	// Stdin mode: one log per line.
	info, _ := os.Stdin.Stat()
	if info.Mode()&os.ModeCharDevice != 0 {
		return fmt.Errorf("no --message given and stdin is a terminal; provide --message or pipe input")
	}

	sc := bufio.NewScanner(os.Stdin)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	var count int
	for sc.Scan() {
		line := sc.Text()
		if line == "" {
			continue
		}
		if err := client.Log(ctx, lvl, line, entryOpts...); err != nil {
			return fmt.Errorf("send line %d: %w", count+1, err)
		}
		count++
	}
	if err := sc.Err(); err != nil {
		return err
	}
	fmt.Fprintf(os.Stderr, "sent %d log(s)\n", count)
	return nil
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
