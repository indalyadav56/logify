package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

func New(cfg Config) (*zap.Logger, error) {
	level := getLogLevel(cfg.Level)

	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "timestamp",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "message",
		StacktraceKey:  "stacktrace",
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.ISO8601TimeEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
		EncodeDuration: zapcore.StringDurationEncoder,
	}

	jsonEncoder := zapcore.NewJSONEncoder(encoderConfig)

	var cores []zapcore.Core

	// stdout core
	stdoutCore := zapcore.NewCore(
		jsonEncoder,
		zapcore.AddSync(os.Stdout),
		level,
	)

	cores = append(cores, stdoutCore)

	// file core
	if cfg.FileEnabled {
		fileWriter := zapcore.AddSync(&lumberjack.Logger{
			Filename:   cfg.FilePath,
			MaxSize:    cfg.MaxSize,
			MaxBackups: cfg.MaxBackups,
			MaxAge:     cfg.MaxAge,
			Compress:   cfg.Compress,
		})

		fileCore := zapcore.NewCore(
			jsonEncoder,
			fileWriter,
			level,
		)

		cores = append(cores, fileCore)
	}

	core := zapcore.NewTee(cores...)

	log := zap.New(
		core,
		zap.AddCaller(),
		zap.AddCallerSkip(1),
		zap.AddStacktrace(zap.ErrorLevel),
	).With(
		zap.String("service", cfg.Service),
		zap.String("environment", cfg.Environment),
	)

	return log, nil
}

func getLogLevel(level string) zapcore.Level {
	switch level {
	case "debug":
		return zap.DebugLevel

	case "warn":
		return zap.WarnLevel

	case "error":
		return zap.ErrorLevel

	default:
		return zap.InfoLevel
	}
}
