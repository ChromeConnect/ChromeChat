import React, { useState } from 'react'

const MessageInput = () => {
  const [message, setMessage] = useState('')
  const handleChange = (event) => setMessage(event.target.value)

  return (
    <input message={message} onChange={handleChange} />
  )
}

export default MessageInput
