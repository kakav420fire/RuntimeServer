import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export const ORDER_COUNT_KEY = "dc_xp_store:order_count"
export const STARTING_ORDERS = 13
