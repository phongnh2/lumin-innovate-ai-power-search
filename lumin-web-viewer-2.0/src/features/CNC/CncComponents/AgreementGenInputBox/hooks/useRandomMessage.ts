import { useEffect, useState } from 'react';

import { THINKING_MESSAGES } from 'features/CNC/constants/agreementGenConstants';

const getRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * THINKING_MESSAGES.length);
  return THINKING_MESSAGES[randomIndex];
};

const RANDOM_MESSAGE_INTERVAL = 3000;

export const useRandomMessage = () => {
  const [message, setMessage] = useState(getRandomMessage());

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(getRandomMessage());
    }, RANDOM_MESSAGE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return {
    message,
  };
};
