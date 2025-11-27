'use client'

import dynamic from 'next/dynamic'

const NewGameRoom = dynamic(() => import('./components/NewGameRoom'), {
  ssr: false, //server side rendering
})

export default function Home() {
  return <NewGameRoom />
}
