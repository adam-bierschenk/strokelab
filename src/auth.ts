import { getServerSession } from "next-auth/next"
import { authOptions } from "./lib/auth"
export { authOptions }

export const auth = async () => getServerSession(authOptions)
