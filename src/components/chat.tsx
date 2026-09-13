"use client";

import type { FormEvent } from "react";
import { useChatbot } from "./chatbot-provider";

export function Chat() {
  const {
    messages,
    status,
    error,
    clearError,
    input,
    setInput,
    sendMessage,
    stop,
  } = useChatbot();

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  return (
    <section className='flex h-[min(760px,85vh)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950'>
      <header className='flex items-center justify-between border-b border-white/10 px-6 py-4'>
        <div>
          <p className='text-sm font-semibold text-white'>Mini Chatbot</p>
          <p className='text-xs text-zinc-500'>status: {status}</p>
        </div>
        <span className='rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300'>
          AI SDK v6
        </span>
      </header>

      <div className='flex-1 space-y-5 overflow-y-auto p-6'>
        {messages.length === 0 && (
          <div className='grid h-full place-items-center text-center'>
            <div>
              <p className='text-lg font-medium text-zinc-200'>
                最初のメッセージを送ってみましょう
              </p>
              <p className='mt-2 text-sm text-zinc-500'>
                モック応答が1文字ずつストリーミングされます。
              </p>
            </div>
          </div>
        )}

        {messages.map(message => (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? "ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-blue-500 px-4 py-3 text-white"
                : "max-w-[82%] rounded-2xl rounded-bl-md bg-white/[0.07] px-4 py-3 text-zinc-200"
            }
          >
            <p className='mb-1 text-[10px] font-bold uppercase tracking-widest opacity-55'>
              {message.role}
            </p>
            {message.parts.map((part, index) =>
              part.type === "text" ? (
                <p
                  key={`${message.id}-${index}`}
                  className='whitespace-pre-wrap'
                >
                  {part.text}
                </p>
              ) : null,
            )}
          </article>
        ))}
      </div>

      {error && (
        <div className='mx-6 mb-3 flex items-center justify-between gap-3 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-300'>
          <p>{error.message}</p>
          <button
            type='button'
            onClick={clearError}
            className='shrink-0 rounded-lg border border-red-300/20 px-3 py-1'
          >
            閉じる
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className='border-t border-white/10 p-4'>
        <div className='flex gap-3'>
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            disabled={isBusy}
            placeholder='メッセージを入力...'
            className='min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-400'
          />
          {isBusy ? (
            <button
              type='button'
              onClick={() => void stop()}
              className='rounded-xl bg-red-400/15 px-5 text-sm font-semibold text-red-300'
            >
              停止
            </button>
          ) : (
            <button
              type='submit'
              disabled={!input.trim()}
              className='rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white disabled:opacity-40'
            >
              送信
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
