import { readFile } from "fs/promises";
import { getMapPath } from "@/lib/cli-paths";
import { validateMapContent } from "@/lib/content-validation";

export async function GET() {
  try {
    const mapPath = getMapPath();
    const content = await readFile(mapPath, "utf-8");

    const result = validateMapContent(content, mapPath);
    if (!result.valid) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ map: content });
  } catch {
    return Response.json(
      { error: "Could not load map file." },
      { status: 500 },
    );
  }
}
