import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Save the uploaded PDF to a temp location
        const buffer = Buffer.from(await file.arrayBuffer());
        const tempDir = path.join(process.cwd(), "tmp");
        await fs.mkdir(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `${Date.now()}_${file.name}`);
        await fs.writeFile(tempPath, buffer);

        let text = "";
        try {
            // Use LangChain PDFLoader to extract text
            const loader = new PDFLoader(tempPath);
            const docs: { pageContent: string }[] = await loader.load();
            text = docs.map((doc) => doc.pageContent).join("\n\n");
        } catch (extractErr) {
            await fs.unlink(tempPath);
            return NextResponse.json({ error: `PDF extraction failed: ${extractErr instanceof Error ? extractErr.message : extractErr}` }, { status: 500 });
        }

        // Clean up temp file
        await fs.unlink(tempPath);

        return NextResponse.json({ text });
    } catch (err) {
        return NextResponse.json({ error: `Server error: ${err instanceof Error ? err.message : err}` }, { status: 500 });
    }
}
