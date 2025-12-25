import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react"

const STORAGE_KEY = "cryptalk_username";

export const useUsername = () => {
  const [username, setUsername] = useState<string | null>(null)

  const generateUsername = (): string => {
    const word = faker.animal.type();
    const username = `anonymous-${word}-${nanoid(5)}`;
    return username;
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem(STORAGE_KEY);
    if (storedUsername) {
      setUsername(storedUsername);
      return;
    }
    const generatedUsername: string = generateUsername();
    localStorage.setItem(STORAGE_KEY, generatedUsername);
    setUsername(generatedUsername);
  }, [])

  return { username }
}