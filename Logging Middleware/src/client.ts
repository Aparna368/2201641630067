import axios from "axios";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

interface AuthResponse {
    token_type: string;
    access_token: string;
    expires_in: number; // unix timestamp
  }
  
  interface LogResponse {
    logID: string;
    message: string;
  }
  
const {
  API_BASE_URL,
  EMAIL,
  NAME,
  ROLL_NO,
  ACCESS_CODE,
  CLIENT_ID,
  CLIENT_SECRET,
} = process.env;

async function getAccessToken(): Promise<string> {
    console.log("API_BASE_URL:", API_BASE_URL);

    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }
  
    const res = await axios.post<AuthResponse>(`${API_BASE_URL}/auth`, {
      email: EMAIL,
      name: NAME,
      rollNo: ROLL_NO,
      accessCode: ACCESS_CODE,
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
  
    cachedToken = res.data.access_token;
    tokenExpiry = res.data.expires_in * 1000; // convert expiry timestamp to ms
  
    return cachedToken!;
  }
  
  export async function sendLog(log: {
    stack: string;
    level: "info" | "warn" | "error" | "debug";
    package: string;
    message: string;
  }): Promise<LogResponse> {
    const token = await getAccessToken();
  
    const res = await axios.post<LogResponse>(`${API_BASE_URL}/logs`, log, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return res.data;
  }
  