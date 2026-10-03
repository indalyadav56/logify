package postgres

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Executor is shared by a pool and a transaction.
type Executor interface {
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
	Query(context.Context, string, ...any) (pgx.Rows, error)
	QueryRow(context.Context, string, ...any) pgx.Row
}

type transactionKey struct{}

type transactionContext struct {
	pool *pgxpool.Pool
	tx   pgx.Tx
}

// ExecutorFromContext keeps repositories on the same transaction when their
// caller starts a unit of work. Outside a transaction it uses the usual pool.
func ExecutorFromContext(ctx context.Context, pool *pgxpool.Pool) Executor {
	if current, ok := ctx.Value(transactionKey{}).(transactionContext); ok && current.pool == pool {
		return current.tx
	}
	return pool
}

type Transactor struct {
	pool *pgxpool.Pool
}

func NewTransactor(pool *pgxpool.Pool) *Transactor {
	return &Transactor{pool: pool}
}

// WithinTransaction commits only when every operation and the commit succeed.
// pgx rolls back on callback errors or panics, using the original request context.
func (t *Transactor) WithinTransaction(ctx context.Context, fn func(context.Context) error) error {
	return pgx.BeginFunc(ctx, t.pool, func(tx pgx.Tx) error {
		txCtx := context.WithValue(ctx, transactionKey{}, transactionContext{pool: t.pool, tx: tx})
		return fn(txCtx)
	})
}
