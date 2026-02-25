import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasAdminAccess } from "@/lib/admin-access";

function escapeXml(value: unknown): string {
    const str = value == null ? "" : String(value);
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function toSheetXml(name: string, records: Record<string, unknown>[]): string {
    const headers = Array.from(new Set(records.flatMap((r) => Object.keys(r))));

    const headerRow = headers
        .map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
        .join("");

    const dataRows = records
        .map((record) => {
            const cells = headers
                .map((h) => {
                    const raw = record[h];
                    const value =
                        raw == null
                            ? ""
                            : typeof raw === "object"
                                ? JSON.stringify(raw)
                                : String(raw);
                    return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
                })
                .join("");
            return `<Row>${cells}</Row>`;
        })
        .join("");

    const bodyRows = records.length > 0
        ? `<Row>${headerRow}</Row>${dataRows}`
        : `<Row><Cell><Data ss:Type="String">No data</Data></Cell></Row>`;

    return `
<Worksheet ss:Name="${escapeXml(name)}">
  <Table>
    ${bodyRows}
  </Table>
</Worksheet>`;
}

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (!hasAdminAccess(user)) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const [teams, users, problems, scores, notifications, sponsors] = await Promise.all([
        prisma.team.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.problemStatement.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.score.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.notification.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.sponsor.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] }),
    ]);

    const workbookXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>Hackthonix Admin</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  ${toSheetXml("Teams", teams as unknown as Record<string, unknown>[])}
  ${toSheetXml("Users", users as unknown as Record<string, unknown>[])}
  ${toSheetXml("ProblemStatements", problems as unknown as Record<string, unknown>[])}
  ${toSheetXml("Scores", scores as unknown as Record<string, unknown>[])}
  ${toSheetXml("Notifications", notifications as unknown as Record<string, unknown>[])}
  ${toSheetXml("Sponsors", sponsors as unknown as Record<string, unknown>[])}
</Workbook>`;

    const fileName = `hackthonix-db-export-${new Date().toISOString().slice(0, 10)}.xls`;

    return new NextResponse(workbookXml, {
        status: 200,
        headers: {
            "Content-Type": "application/vnd.ms-excel; charset=utf-8",
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Cache-Control": "no-store",
        },
    });
}
