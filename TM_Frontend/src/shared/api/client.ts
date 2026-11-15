import axios from "axios";
import { BACKEND_URL } from "../config";
export const api = axios.create({ baseURL: BACKEND_URL, withCredentials: true });
export function messageFromError(error: unknown) {
  if (axios.isAxiosError(error))
    return error.response?.data?.message ?? "Something went wrong. Please try again.";
  return "Something went wrong. Please try again.";
}
