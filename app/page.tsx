"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 dark:bg-black">
      <h1 className="text-4xl font-bold text-black dark:text-white">
        Hello, jin&apos;s world
      </h1>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-lg p-8">
        {submitted ? (
          <div className="text-center">
            <p className="text-2xl font-bold text-black dark:text-white mb-2">감사합니다!</p>
            <p className="text-gray-500">{email} 으로 소식을 보내드릴게요.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">소식을 받아보세요</h1>
            <p className="text-gray-500 mb-6">이메일을 입력하면 업데이트를 알려드려요.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                required
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold py-3 hover:opacity-80 transition"
              >
                구독하기
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
