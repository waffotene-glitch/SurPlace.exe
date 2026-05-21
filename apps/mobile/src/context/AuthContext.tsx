import React, { createContext, useContext, useEffect, useState } from "react";
import { login, register, getMe } from "../services/authApi";
import { clearStoredSession, getStoredSession, saveSession } from "../services/authStorage";
import { AuthUser, UserRole } from "../types/api";
