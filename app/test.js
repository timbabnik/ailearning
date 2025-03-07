"use client"

import React from 'react'
import { useRouter } from "next/router";

function test() {

  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push("/")}>test</button>
    </div>
  )
}

export default test