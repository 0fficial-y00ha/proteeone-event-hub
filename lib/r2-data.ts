import { env } from "cloudflare:workers";

type R2Env = { DATA?: R2Bucket };

function bucket() {
  const data = (env as R2Env).DATA;
  if (!data) throw new Error("R2 데이터 저장소가 연결되지 않았습니다.");
  return data;
}

export async function readDataJson<T>(key: string): Promise<T> {
  const object = await bucket().get(`data/${key}`);
  if (!object) throw new Error(`R2 데이터가 없습니다: ${key}`);
  return object.json<T>();
}
